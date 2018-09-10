#!/usr/bin/env node
'use strict';

const
  chalk = require('chalk'),
  clear = require('clear'),
  figlet = require('figlet'),
  cli = require('commander'),
  inquirer = require('inquirer'),
  checkConfig = require('./helpers/check-config');

const
  migrationReset = require('./command/migrationReset'),
  migrationRollback = require('./command/migrationRollback'),
  migrationRun = require('./command/migrationRun'),
  migrationStatus = require('./command/migrationStatus'),
  seed = require('./command/seed'),
  makeMigration = require('./command/makeMigration'),
  makeSeed = require('./command/makeSeed');

clear();
console.log(
  chalk.yellow(
    figlet.textSync('Knex CLI', { horizontalLayout: 'full' })
  )
);

cli
  .version('0.0.1')
  .description('DB Management')
  .option('-s --stage [stage]', 'Configures the current environment', 'dev')
  .option('-c --config [config]', 'Path of the JSON config')
  .parse(process.argv);

checkConfig({ stage: cli.stage, config: cli.config });

console.log(`Using environment: ${chalk.red(`${cli.stage}`)}`);
console.log(`Current project: ${chalk.green(`${process.env.project_name}`)}`);

cli
  .command('migration:refresh')
  .description('Refresh migrations by performing rollback and then running from start')
  .action(async () => {
    await migrationReset();
    await migrationRun();
    DbClient.destroy();
  });

cli
  .command('migration:reset')
  .description('Rollback migration to the first batch')
  .action(async () => {
    await migrationReset();
    DbClient.destroy();
  });

cli
  .command('migration:rollback')
  .description('Rollback migration to latest batch or to a specific batch number')
  .action(async () => {
    await migrationRollback();
    DbClient.destroy();
  });

cli
  .command('migration:run')
  .description('Run all pending migrations')
  .action(async () => {
    await migrationRun();
    DbClient.destroy();
  });

cli
  .command('migration:status')
  .description('Check migrations current status')
  .action(async () => {
    await migrationStatus();
    DbClient.destroy();
  });

cli
  .command('seed')
  .description('Seed database using seed files')
  .action(async () => {
    await seed();
    DbClient.destroy();
  });

cli
  .command('make:migration <name> <tableName>')
  .description('Create a new migration file')
  .action((name, tableName) => {
    inquirer.prompt({
      type: 'list',
      name: 'type',
      message: 'Choose an action',
      choices: [
        {
          name: 'Create table',
          value: 'create'
        },
        {
          name: 'Select table',
          value: 'select'
        }
      ]
    }).then(({ type }) => makeMigration({name, tableName, type}));
  });

cli
  .command('make:seed <name>')
  .description('Create a database seeder')
  .action(makeSeed);

cli.parse(process.argv);

if (!cli.args.length) cli.help();