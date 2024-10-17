const { Sequelize } = require('sequelize');
const config = require('../config/config.js')[process.env.NODE_ENV || 'test'];
const UserModel = require('../src/models/User');

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
    await sequelize.authenticate();
    await sequelize.sync({ force: true, alter: true }); // This will create all tables and alter existing ones
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Unable to connect to the database or sync schema:', error);
    throw error;
  }
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  const models = sequelize.models;
  for (const model in models) {
    await models[model].destroy({ where: {}, truncate: true, cascade: true });
  }
});

module.exports = { sequelize, User };
