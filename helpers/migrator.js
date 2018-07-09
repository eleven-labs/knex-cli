'use strict';

const BaseMigrator = require('knex/lib/migrate');
const helpers = require('knex/lib/helpers');
const path = require('path');
const Promise = require('bluebird');
const { each, map, difference, isEmpty } = require('lodash');

// Validates that migrations are present in the appropriate directories.
const validateMigrationList = (migrations) => {
    const all = migrations[0];
    const completed = migrations[1];
    const diff = difference(completed, all);
    if (!isEmpty(diff)) {
        throw new Error(
            `The migration directory is corrupt, the following files are missing: ${diff.join(', ')}`
        );
    }
}

//Get schema-aware table name
const getTableName = (tableName, schemaName) => {
    return schemaName ? `${schemaName}.${tableName}` : tableName;
}

//Get schema-aware query builder for a given table and schema name
const getTable = (trxOrKnex, tableName, schemaName) => {
    return schemaName ? trxOrKnex(tableName).withSchema(schemaName) : trxOrKnex(tableName);
}

//Get schema-aware schema builder for a given schema nam
const getSchemaBuilder = (trxOrKnex, schemaName) => {
    return schemaName ? trxOrKnex.schema.withSchema(schemaName) : trxOrKnex.schema;
}

const warnPromise = (value, name, fn) => {
    if (!value || typeof value.then !== 'function') {
        helpers.warn(`migration ${name} did not return a promise`);
        if (fn && typeof fn === 'function') fn()
    }
    return value;
}

class Migrator extends BaseMigrator {

    _createMigrationTable(tableName, schemaName, trx = this.knex) {
        return getSchemaBuilder(trx, schemaName).createTable(getTableName(tableName), function (t) {
            t.increments();
            t.string('name');
            t.integer('batch');
            t.string('project_name').defaultTo('default');
            t.timestamp('migration_time');
        });
    }

    // Lists all migrations that have been completed for the current db, as an
    // array.
    _listCompleted(trx = this.knex) {
        const { tableName, schemaName } = this.config;
        return this._ensureTable(trx)
            .then(() => trx.from(getTableName(tableName, schemaName))
                .where({ project_name: process.env.project_name })
                .orderBy('id').select('name'))
            .then((migrations) => map(migrations, 'name'))
    }

    // Get the last batch of migrations, by name, ordered by insert id in reverse
    // order.
    _getLastBatch() {
        const { tableName, schemaName } = this.config;
        return getTable(this.knex, tableName, schemaName)
            .where({ project_name: process.env.project_name })
            .where('batch', function (qb) {
                qb.max('batch').from(getTableName(tableName, schemaName))
                    .where({ project_name: process.env.project_name })
            })
            .orderBy('id', 'desc');
    }

    // Get all batch of migrations, by name, ordered by insert id in reverse
    // order.
    _getAllBatch() {
        const { tableName, schemaName } = this.config;
        return getTable(this.knex, tableName, schemaName)
            .orderBy('id', 'desc');
    }

    async getAllMigrations() {
        const all = await this._listAll();

        const migratedMigrations = await this._getAllBatch();

        return all.map((migrationName) => {
            const migratedMigration = migratedMigrations.find((migration) => migration.name === migrationName);
            return {
                name: migrationName,
                migrated: migratedMigration ? true : false,
                batch: migratedMigration ? migratedMigration.batch : null
            };
        });
    }

    // Returns the latest batch number.
    _latestBatchNumber(trx = this.knex) {
        return trx.from(getTableName(this.config.tableName, this.config.schemaName))
            .where({ project_name: process.env.project_name })
            .max('batch as max_batch').then(obj => obj[0].max_batch || 0);
    }

    // appropriate database information as the migrations are run.
    _waterfallBatch(batchNo, migrations, direction, trx) {
        const trxOrKnex = trx || this.knex;
        const { tableName, schemaName, disableTransactions } = this.config;
        const directory = this._absoluteConfigDir();
        let current = Promise.bind({ failed: false, failedOn: 0 });
        const log = [];
        each(migrations, (migration) => {
            const name = migration;
            this._activeMigration.fileName = name;
            migration = require(directory + '/' + name);

            // We're going to run each of the migrations in the current "up".
            current = current.then(() => {
                if (!trx && this._useTransaction(migration, disableTransactions)) {
                    return this._transaction(migration, direction, name)
                }
                return warnPromise(migration[direction](trxOrKnex, Promise), name)
            })
                .then(() => {
                    log.push(path.join(directory, name));
                    if (direction === 'up') {
                        return trxOrKnex.into(getTableName(tableName, schemaName)).insert({
                            name,
                            batch: batchNo,
                            project_name: process.env.project_name,
                            migration_time: new Date()
                        });
                    }
                    if (direction === 'down') {
                        return trxOrKnex.from(getTableName(tableName, schemaName)).where({ name }).del();
                    }
                });
        });

        return current.thenReturn([batchNo, log]);
    }

    // Rollback all migrations to the 0 batch.
    reset(config) {
        return Promise.try(() => {
            this.config = this.setConfig(config);
            return this._migrationData()
                .tap(validateMigrationList)
                .then(() => this._getAllBatch())
                .then((migrations) => this._runBatch(map(migrations, 'name'), 'down'));
        })
    }
}

module.exports = Migrator;