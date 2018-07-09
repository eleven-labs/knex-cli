'use strict';

const
  path = require('path'),
  chalk = require('chalk'),
  prettyHrtime = require('pretty-hrtime'),
  Migrator = require('../helpers/migrator');

const migrationRun = async () => {
  const
    start = process.hrtime(),
    DbClient = global.DbClient,
    migrate = new Migrator(DbClient);

  let [type, migrations] = await migrate.latest();

  if (migrations.length === 0) {
    console.log(chalk.cyan(`Nothing to migrate`));
  } else {
    migrations = migrations.map(migration => path.basename(migration));
    console.log(chalk.yellow(`Batch 1 run: ${migrations.length} migrations`));
    migrations.forEach(migration => {
      console.log(`${chalk.cyan('migrate:')} ${migration}`);
    });
  }

  const end = process.hrtime(start);
  console.log(chalk.yellow(`Database migrated successfully in ${prettyHrtime(end)}`));

  return new Promise((resolve) => resolve({ success: true }));
};

module.exports = migrationRun;