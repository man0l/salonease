const { Sequelize } = require('sequelize');
const config = require('../config/config.js');

// Check if we're in the test environment
if (process.env.NODE_ENV !== 'test') {
  process.exit(1);
}

const testConfig = config.test;

const sequelize = new Sequelize(testConfig.database, testConfig.username, testConfig.password, {
  host: testConfig.host,
  dialect: testConfig.dialect,
  logging: testConfig.logging,
});

// Initialize models
const User = require('../src/models/User')(sequelize);
const Salon = require('../src/models/Salon')(sequelize);
const Client = require('../src/models/Client')(sequelize);
const RefreshToken = require('../src/models/RefreshToken')(sequelize);
const Staff = require('../src/models/Staff')(sequelize);
const StaffAvailability = require('../src/models/StaffAvailability')(sequelize);
const Service = require('../src/models/Service')(sequelize);
const Category = require('../src/models/Category')(sequelize);

// Add models to sequelize.models
sequelize.models.User = User;
sequelize.models.Salon = Salon;
sequelize.models.Client = Client;
sequelize.models.RefreshToken = RefreshToken;
sequelize.models.Staff = Staff;
sequelize.models.StaffAvailability = StaffAvailability;
sequelize.models.Service = Service;
sequelize.models.Category = Category;

// Run associations
User.associate(sequelize.models);
Salon.associate(sequelize.models);
Client.associate(sequelize.models);
RefreshToken.associate(sequelize.models);
Staff.associate(sequelize.models);
StaffAvailability.associate(sequelize.models);
Service.associate(sequelize.models);
Category.associate(sequelize.models);

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
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
      TRUNCATE TABLE "Salons", "Clients", "Users", "RefreshTokens", "Staffs", "StaffAvailabilities", "Services", "Categories"
      RESTART IDENTITY
      CASCADE;
    `);
  } catch (error) {
    throw error;
  }
});

module.exports = { sequelize, User, Salon, Client, RefreshToken, Staff, StaffAvailability, Service, Category };
