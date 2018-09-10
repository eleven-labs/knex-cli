# Knex Cli

## Requirements

Have the config file `knexfile.js` at the root of the project.

Example config:

```js
'use strict';

const config = {
    dev: {
        client: 'mysql',
        connection: process.env.DB_URL,
        migrations: {
            directory: __dirname + '/migrations'
        },
        seeds: {
            directory: __dirname + '/seeds'
        },
    },
};

module.exports = config;
```

And if you want to use a JSON config that will set your variables in `process. Env`, you must create the config file for the environments that you are going to use, it contains the identification parameters to the database.

Example for the `dev` environment (stage), the file will be named `config.dev.json` and may contain:

```json
{
    "DB_URL": "mysql://username:password@localhost:3306/dbname"
}
```

## Options on all commands:

| Command | Description |
| --- | --- |
| `knex-cli --stage=[STAGE]` | Configures the current environment |
| `knex-cli --config=[CONFIG_PATH]` | Path of the JSON config |

## Available commands:

| Command | Description |
| --- | --- |
| `knex-cli migration:status` | Check migrations current status |
| `knex-cli migration:run` | Run all pending migrations |
| `knex-cli migration:rollback` | Rollback migration to latest batch or to a specific batch number |
| `knex-cli migration:reset` | Rollback migration to the first batch |
| `knex-cli seed` | Seed database using seed files |
| `knex-cli make:migration [name] [tableName]` | Create a new migration file |
| `knex-cli make:seed [name]` | Create a database seeder |