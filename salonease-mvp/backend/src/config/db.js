const { Sequelize } = require('sequelize');
const config = require('../../config/config.js')[process.env.NODE_ENV || 'development'];
const UserModel = require('../models/User');
const SalonModel = require('../models/Salon');
const RefreshTokenModel = require('../models/RefreshToken');
const StaffModel = require('../models/Staff');

console.log('Using database config:', config);

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: config.logging,
});

// Initialize models
const User = UserModel(sequelize);
const Salon = SalonModel(sequelize);
const RefreshToken = RefreshTokenModel(sequelize);
const Staff = StaffModel(sequelize);

// Add models to sequelize.models
sequelize.models.User = User;
sequelize.models.Salon = Salon;
sequelize.models.RefreshToken = RefreshToken;
sequelize.models.Staff = Staff;

// Run associations if any
Object.values(sequelize.models).forEach((model) => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models with the database
    await sequelize.sync();
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    if (process.env.NODE_ENV === 'test') {
      throw error; // Throw error in test environment
    } else {
      process.exit(1); // Exit in non-test environments
    }
  }
};

module.exports = { sequelize, connectToDatabase, User, Salon, RefreshToken, Staff };
