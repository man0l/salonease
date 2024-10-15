const { DataTypes } = require('sequelize');
const sequelize = require('../../src/config/db');
const User = require('../../src/models/User');
const bcrypt = require('bcrypt');

describe('User Model', () => {
  let createdUsers = [];

  beforeAll(async () => {
    await sequelize.sync(); // Ensure sync does not use force: true
  });

  afterEach(async () => {
    // Cleanup: Remove only the users created during the tests
    for (const user of createdUsers) {
      await User.destroy({ where: { id: user.id } });
    }
    createdUsers = [];
  });

  afterAll(async () => {
    await sequelize.close(); // Close the database connection
  });

  it('should create a user with valid attributes', async () => {
    
    const user = await User.create({
      fullName: 'Test User',
      email: `testuser_${Date.now()}@example.com`, // Ensure unique email
      password: await bcrypt.hash('Password123!', 10),
    });

    // Fetch the user again to ensure the password is hashed
    const fetchedUser = await User.findByPk(user.id);
    const isPasswordValid = await bcrypt.compare('Password123!', fetchedUser.password);

    expect(user.fullName).toBe('Test User');
    expect(user.email).toMatch(/testuser_\d+@example.com/);
    expect(isPasswordValid).toBe(true);
    expect(user.role).toBe('SalonOwner');
    expect(user.isEmailVerified).toBe(false);

    // Track created user for cleanup
    createdUsers.push(user);
  });

  it('should not create a user with duplicate email', async () => {
    const user = await User.create({
      fullName: 'Test User',
      email: 'duplicate@example.com',
      password: 'Password123!',
    });

    // Track created user for cleanup
    createdUsers.push(user);

    await expect(User.create({
      fullName: 'Another User',
      email: 'duplicate@example.com',
      password: 'Password123!',
    })).rejects.toThrow();
  });
});
