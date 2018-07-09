'use strict';

const
    path = require('path'),
    fs = require('fs'),
    chalk = require('chalk'),
    ejs = require('ejs'),
    { currentDateToFlat } = require('../helpers/date'),
    { pascalCase } = require('../helpers/string');

const makeSeed = async (name) => {
    const
        DbClient = global.DbClient,
        { seeds: config } = DbClient.client.config,
        viewsDirectory = `${__dirname}/../views`,
        seedFilename = `${config.directory}/${name}.js`;

    if (fs.existsSync(seedFilename)) {
        console.log(chalk.red(`Error: ${seedFilename} already exists.`));
        process.exit();
    }

    let jsContent = fs.readFileSync(`${viewsDirectory}/seed.ejs`, 'utf8');

    jsContent = ejs.render(jsContent, {
        name: pascalCase(name)
    });

    fs.writeFileSync(seedFilename, jsContent, 'utf8');
};

module.exports = makeSeed;