const {Sequelize} = require('@sequelize/core');
const {Umzug, SequelizeStorage} = require('umzug');
const {MySqlDialect} = require('@sequelize/mysql');

const sequelize = new Sequelize({
    dialect: MySqlDialect,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
});



module.exports = {
  init_db: async function () {
    console.log('initializing db connection');
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log('All models were synchronized successfully.');
  },
  sequelize: sequelize
};
