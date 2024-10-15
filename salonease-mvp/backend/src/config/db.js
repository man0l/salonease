const { Sequelize } = require('sequelize');

const databaseUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

const sequelize = new Sequelize(databaseUrl || {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
