const { Sequelize } = require('sequelize');
const config = require('../../config/config.js')[process.env.NODE_ENV || 'development'];
const UserModel = require('../models/User');
const SalonModel = require('../models/Salon');
const RefreshTokenModel = require('../models/RefreshToken');
const StaffModel = require('../models/Staff');

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
    await sequelize.sync();
  } catch (error) {
    if (process.env.NODE_ENV === 'test') {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectToDatabase, User, Salon, RefreshToken, Staff };
