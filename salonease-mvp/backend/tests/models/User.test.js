const { DataTypes } = require('sequelize');
const { sequelize, User } = require('../setupTests');
const bcrypt = require('bcrypt');

describe('User Model', () => {
  let createdUsers = [];

  afterEach(async () => {
    // Cleanup: Remove only the users created during the tests
    for (const user of createdUsers) {
      await User.destroy({ where: { id: user.id } });
    }
    createdUsers = [];
  });

  it('should create a user with valid attributes', async () => {
    const user = await User.create({
      fullName: 'Test User',
      email: `testuser_${Date.now()}@example.com`,
      password: await bcrypt.hash('Password123!', 10),
    });

    expect(user.fullName).toBe('Test User');
    expect(user.email).toMatch(/testuser_\d+@example.com/);
    expect(user.role).toBe('SalonOwner');
    expect(user.isEmailVerified).toBe(false);

    const fetchedUser = await User.findByPk(user.id);
    const isPasswordValid = await bcrypt.compare('Password123!', fetchedUser.password);
    expect(isPasswordValid).toBe(true);
  });

  it('should not create a user with duplicate email', async () => {
    await User.create({
      fullName: 'Test User',
      email: 'duplicate@example.com',
      password: 'Password123!',
    });

    await expect(User.create({
      fullName: 'Another User',
      email: 'duplicate@example.com',
      password: 'Password123!',
    })).rejects.toThrow();
  });
});
