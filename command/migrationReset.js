'use strict';

const
  path = require('path'),
  chalk = require('chalk'),
  prettyHrtime = require('pretty-hrtime'),
  Migrator = require('../helpers/migrator');

const migrationReset = async () => {
  const
    start = process.hrtime(),
    DbClient = global.DbClient,
    migrate = new Migrator(DbClient);

  let [type, migrations] = await migrate.reset();

  if (migrations.length === 0) {
    console.log(chalk.cyan(`Already at the last batch`));
  } else {
    migrations = migrations.map(migration => path.basename(migration));
    console.log(chalk.yellow(`All batch rolled back: ${migrations.length} migrations`));
    migrations.forEach(migration => {
      console.log(`${chalk.cyan('rollback: ')} ${migration}`);
    });
  }

  const end = process.hrtime(start);
  console.log(chalk.yellow(`Reset completed in ${prettyHrtime(end)}`));

  return new Promise((resolve) => resolve({ success: true }));
};

module.exports = migrationReset;