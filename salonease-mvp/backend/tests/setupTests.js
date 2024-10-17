const { Sequelize } = require('sequelize');
const config = require('../config/config.js')[process.env.NODE_ENV || 'test'];
const UserModel = require('../src/models/User');
const SalonModel = require('../src/models/Salon');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false,
});

// Initialize models
const User = UserModel(sequelize);
const Salon = SalonModel(sequelize);

// Add models to sequelize.models
sequelize.models.User = User;
sequelize.models.Salon = Salon;

// Run associations
User.associate(sequelize.models);
Salon.associate(sequelize.models);

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // This will drop and recreate all tables
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
  try {
    // Use a single query to truncate all tables at once
    await sequelize.query(`
      TRUNCATE TABLE "Salons", "Users"
      RESTART IDENTITY
      CASCADE;
    `);
    
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
});

module.exports = { sequelize, User, Salon };
