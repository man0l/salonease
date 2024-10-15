const { DataTypes } = require('sequelize');
const sequelize = require('../../src/config/db');
const User = require('../../src/models/User');

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
      email: 'testuser@example.com',
      password: 'Password123!',
    });

    expect(user.fullName).toBe('Test User');
    expect(user.email).toBe('testuser@example.com');
    expect(user.password).toBe('Password123!');
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
