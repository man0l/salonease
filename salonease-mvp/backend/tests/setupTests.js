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
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
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
const Booking = require('../src/models/Booking')(sequelize);
const SalonImage = require('../src/models/SalonImage')(sequelize);

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
sequelize.models.SalonImage = SalonImage;

// Run associations
User.associate(sequelize.models);
Salon.associate(sequelize.models);
Client.associate(sequelize.models);
RefreshToken.associate(sequelize.models);
Staff.associate(sequelize.models);
StaffAvailability.associate(sequelize.models);
Service.associate(sequelize.models);
Category.associate(sequelize.models);
Booking.associate(sequelize.models);
SalonImage.associate(sequelize.models);

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Close all connections in the pool
    const pool = sequelize.connectionManager.pool;
    if (pool) {
      await Promise.all([
        ...Object.values(pool._acquiringConnections || []),
        ...Object.values(pool._allConnections || [])
      ].filter(Boolean).map(async (conn) => {
        try {
          // Rollback any open transactions on the connection
          await conn.query('ROLLBACK');
          await conn.close();
        } catch (err) {
          console.warn('Error closing connection:', err.message);
        }
      }));
    }

    // Finally close the sequelize instance
    await sequelize.close();
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
});

beforeEach(async () => {
  try {
    // Use a transaction for the TRUNCATE operation
    await sequelize.transaction(async (t) => {
      await sequelize.query(`
        TRUNCATE TABLE "Salons", "Clients", "Users", "RefreshTokens", "Staffs", 
        "StaffAvailabilities", "Services", "Categories", "Bookings", "SalonImages"
        RESTART IDENTITY
        CASCADE;
      `, { transaction: t });
    });
  } catch (error) {
    console.error('Error in beforeEach:', error);
    throw error;
  }
});

module.exports = { 
  sequelize, 
  User, 
  Salon, 
  Client, 
  RefreshToken, 
  Staff, 
  StaffAvailability, 
  Service, 
  Category, 
  Booking,
  SalonImage 
};
