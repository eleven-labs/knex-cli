'use strict';

const
    path = require('path'),
    fs = require('fs'),
    chalk = require('chalk'),
    ejs = require('ejs'),
    { currentDateToFlat } = require('../helpers/date'),
    { pascalCase } = require('../helpers/string');

const makeMigration = async ({ name, tableName, type }) => {
    const
        DbClient = global.DbClient,
        { migrations: config } = DbClient.client.config,
        viewsDirectory = `${__dirname}/../views`,
        migrationFilename = `${config.directory}/${currentDateToFlat()}_${name}.js`;

    let jsContent = fs.readFileSync(`${viewsDirectory}/migration.ejs`, 'utf8');

    jsContent = ejs.render(jsContent, {
        name: pascalCase(name),
        tableName,
        type
    });

    fs.writeFileSync(migrationFilename, jsContent, 'utf8');
};

module.exports = makeMigration;