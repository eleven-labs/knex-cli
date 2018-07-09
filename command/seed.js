'use strict';

const
    path = require('path'),
    chalk = require('chalk'),
    prettyHrtime = require('pretty-hrtime');

const seed = async () => {
    const
        start = process.hrtime(),
        DbClient = global.DbClient;

    let [seeds] = await DbClient.seed.run();

    if (seeds.length === 0) {
        console.log(chalk.cyan(`No seed files exist`));
    } else {
        seeds = seeds.map(seed => path.basename(seed));

        console.log(chalk.yellow(`Run ${seeds.length} seed files`));
        seeds.forEach(seed => {
            console.log(`${chalk.cyan('Seed:')} ${seed}`);
        });
    }

    const end = process.hrtime(start);
    console.log(chalk.yellow(`Seeded database in ${prettyHrtime(end)}`));

    return new Promise((resolve) => resolve({ success: true }));
};

module.exports = seed;