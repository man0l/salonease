const { Sequelize } = require('sequelize');
const config = require('../../config/config.js')[process.env.NODE_ENV || 'development'];
const UserModel = require('../models/User');
const SalonModel = require('../models/Salon');
const ClientModel = require('../models/Client'); // Import the Client model
const RefreshTokenModel = require('../models/RefreshToken');
const StaffModel = require('../models/Staff');
const StaffAvailabilityModel = require('../models/StaffAvailability');
const ServiceModel = require('../models/Service');
const CategoryModel = require('../models/Category');
const BookingModel = require('../models/Booking');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: config.logging,
});

// Initialize models
const User = UserModel(sequelize);
const Salon = SalonModel(sequelize);
const Client = ClientModel(sequelize); // Initialize the Client model
const RefreshToken = RefreshTokenModel(sequelize);
const Staff = StaffModel(sequelize);
const StaffAvailability = StaffAvailabilityModel(sequelize);
const Service = ServiceModel(sequelize);
const Category = CategoryModel(sequelize);
const Booking = BookingModel(sequelize);

// Add models to sequelize.models
sequelize.models.User = User;
sequelize.models.Salon = Salon;
sequelize.models.Client = Client;
sequelize.models.RefreshToken = RefreshToken;
sequelize.models.Staff = Staff;
sequelize.models.StaffAvailability = StaffAvailability;
sequelize.models.Service = Service;
sequelize.models.Category = Category;
sequelize.models.Booking = Booking;

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

module.exports = { 
  sequelize, 
  connectToDatabase, 
  User, 
  Salon, 
  Client, // Export the Client model
  RefreshToken, 
  Staff, 
  StaffAvailability,
  Service,
  Category,
  Booking
};
