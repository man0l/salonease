const { Sequelize } = require('sequelize');
const config = require('../config/config.js')[process.env.NODE_ENV || 'test'];
const UserModel = require('../src/models/User');

console.log('Test database config:', config);

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false,
});

// Initialize models
const User = UserModel(sequelize);

// Add models to sequelize.models
sequelize.models.User = User;

beforeAll(async () => {
  try {
    console.log('Attempting to connect to the database...');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    console.log('Syncing database...');
    await sequelize.sync({ force: true }); // This will create all tables
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
});

afterAll(async () => {
  console.log('Closing database connection...');
  await sequelize.close();
  console.log('Database connection closed.');
});

beforeEach(async () => {
  console.log('Clearing tables...');
  const models = sequelize.models;
  for (const model in models) {
    await models[model].destroy({ where: {}, truncate: true, cascade: true });
  }
  console.log('Tables cleared.');
});

module.exports = { sequelize, User };
