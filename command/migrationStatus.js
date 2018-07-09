'use strict';

const
  path = require('path'),
  chalk = require('chalk'),
  Table = require('cli-table'),
  Migrator = require('../helpers/migrator');

const migrationStatus = async () => {
  const
    executionStart = new Date(),
    DbClient = global.DbClient,
    migrate = new Migrator(DbClient);


  const migrations = await migrate.getAllMigrations();

  const
    head = ['File name', 'Migrated', 'Batch'],
    style = { head: ['cyan'] },
    table = new Table({ head, style });

  migrations.forEach((migration, key) => {
    const body = [migration.name, migration.migrated ? 'Yes' : 'No', migration.batch || ''];
    table.push(body);
  });

  console.log(table.toString());

  return new Promise((resolve) => resolve({ success: true }));
};

module.exports = migrationStatus;