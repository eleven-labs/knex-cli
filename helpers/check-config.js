'use strict';

const fs = require('fs')
const path = require('path');
const chalk = require('chalk');
const knex = require('knex');

const checkConfig = ({ stage, filePathConfig = `${process.cwd()}/config.${stage}.json` }) => {
  const knexConfig = `${process.cwd()}/knexfile.js`;

  if (!fs.existsSync(knexConfig)) {
    console.log(chalk.red(`Knex file doesn't exist: ${knexConfig}.`));
    process.exit();
  }

  if (fs.existsSync(filePathConfig)) {
    const config = JSON.parse(fs.readFileSync(filePathConfig, 'utf8'));
    for (const key in config) {
      process.env[key] = config[key];
    }
  }

  process.env.project_name = path.basename(process.cwd());

  global.DbClient = knex({
    ...require(knexConfig)[stage],
    pool: { min: 0, max: 7 }
  });
};

module.exports = checkConfig;