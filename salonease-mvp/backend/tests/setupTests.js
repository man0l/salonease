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
const RefreshToken = require('../src/models/RefreshToken')(sequelize);
const Staff = require('../src/models/Staff')(sequelize);
const StaffAvailability = require('../src/models/StaffAvailability')(sequelize);

// Add models to sequelize.models
sequelize.models.User = User;
sequelize.models.Salon = Salon;
sequelize.models.RefreshToken = RefreshToken;
sequelize.models.Staff = Staff;
sequelize.models.StaffAvailability = StaffAvailability;

// Run associations
User.associate(sequelize.models);
Salon.associate(sequelize.models);
RefreshToken.associate(sequelize.models);
Staff.associate(sequelize.models);
StaffAvailability.associate(sequelize.models);

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
      TRUNCATE TABLE "Salons", "Users", "RefreshTokens", "Staffs", "StaffAvailabilities"
      RESTART IDENTITY
      CASCADE;
    `);
  } catch (error) {
    throw error;
  }
});

module.exports = { sequelize, User, Salon, RefreshToken, Staff, StaffAvailability };
