const { DataTypes } = require('sequelize');
const { sequelize, RefreshToken, User } = require('../setupTests');

describe('RefreshToken Model', () => {

  it('should create a refresh token with valid attributes', async () => {
    const user = await User.create({
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123!'      
    });

    const refreshToken = await RefreshToken.create({
      token: 'validtoken123',
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    expect(refreshToken.token).toBe('validtoken123');
    expect(refreshToken.userId).toBe(user.id);
    expect(refreshToken.expiresAt).toBeInstanceOf(Date);

    const fetchedToken = await RefreshToken.findByPk(refreshToken.id);
    expect(fetchedToken).not.toBeNull();
  });

  it('should not create a refresh token without a token', async () => {
    const user = await User.create({
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123!'      
    });

    await expect(RefreshToken.create({
      userId: user.id,
      expiresAt: new Date()
    })).rejects.toThrow();
  });

  it('should not create a refresh token without a userId', async () => {
    await expect(RefreshToken.create({
      token: 'tokenwithoutuserid',
      expiresAt: new Date()
    })).rejects.toThrow();
  });

  it('should not create a refresh token without an expiresAt date', async () => {
    const user = await User.create({
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123!'      
    });

    await expect(RefreshToken.create({
      token: 'tokenwithoutexpiry',
      userId: user.id
    })).rejects.toThrow();
  });

  it('should associate a refresh token with a user', async () => {
    const user = await User.create({
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123!'      
    });

    const refreshToken = await RefreshToken.create({
      token: 'associatedtoken',
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const tokenWithUser = await RefreshToken.findByPk(refreshToken.id, {
      include: [{ model: User }]
    });

    expect(tokenWithUser.User).toBeDefined();
    expect(tokenWithUser.User.id).toBe(user.id);
  });
});
