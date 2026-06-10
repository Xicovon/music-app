const {Sequelize} = require('@sequelize/core');
const {Umzug, SequelizeStorage} = require('umzug');
const {MySqlDialect} = require('@sequelize/mysql');

const sequelize = new Sequelize({
    dialect: MySqlDialect,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    port: 3306,
});

module.exports = {
  init_db: async function () {
    console.log('initializing db connection');
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log('All models were synchronized successfully.');
    //const umzug = new Umzug({
    //    migrations: {glob: 'migrations/*.js'},
    //    context: sequelize.queryInterface,
    //    storage: new SequelizeStorage({sequelize}),
    //    logger: console,
    //})

    // Checks migrations and run them if they are not already applied. To keep
    // track of the executed migrations, a table (and sequelize model) called SequelizeMeta
    // will be automatically created (if it doesn't exist already) and parsed.
    //await umzug.up()
  },
  num: 3,
  sequelize: sequelize
};
