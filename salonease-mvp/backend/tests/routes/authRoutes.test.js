const request = require('supertest');
const app = require('../../src/app');
const { User, sequelize } = require('../setupTests');
const bcrypt = require('bcrypt');
const emailHelper = require('../../src/utils/helpers/emailHelper');

// Mock the emailHelper
jest.mock('../../src/utils/helpers/emailHelper', () => ({
  sendPasswordResetEmail: jest.fn(),
  sendVerificationEmail: jest.fn(),
}));

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await User.destroy({ where: {}, truncate: true });
  jest.clearAllMocks();
});

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123!',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Registration successful. Please check your email to verify your account.');

    const createdUser = await User.findOne({ where: { email: 'testuser@example.com' } });
    expect(createdUser).not.toBeNull();
    expect(emailHelper.sendVerificationEmail).toHaveBeenCalledWith(createdUser.email, expect.any(String));
  });

  it('should not register a user with an existing email', async () => {
    await User.create({
      fullName: 'Existing User',
      email: 'existinguser@example.com',
      password: 'Password123!',
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'New User',
        email: 'existinguser@example.com',
        password: 'Password123!',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email already exists');
  });

  it('should return validation error for invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Invalid Email User',
        email: 'invalid-email',
        password: 'Password123!',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('Email is invalid');
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('should send a password reset email for a valid user', async () => {
    const user = await User.create({
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SalonOwner',
    });

    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: user.email });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password reset email sent');
    expect(emailHelper.sendPasswordResetEmail).toHaveBeenCalledWith(user.email, expect.any(String));

    const updatedUser = await User.findByPk(user.id);
    expect(updatedUser.resetToken).toBeTruthy();
    expect(updatedUser.resetTokenExpiry).toBeTruthy();
  });

  it('should return 404 for non-existent user', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

describe('POST /api/auth/reset-password', () => {
  it('should reset password with a valid token', async () => {
    const resetToken = 'validtoken123';
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    const user = await User.create({
      fullName: 'Reset Test User',
      email: 'resettest@example.com',
      password: await bcrypt.hash('oldpassword123', 10),
      role: 'SalonOwner',
      resetToken,
      resetTokenExpiry,
    });

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'newpassword456',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password has been reset successfully');

    const updatedUser = await User.findByPk(user.id);
    expect(await bcrypt.compare('newpassword456', updatedUser.password)).toBe(true);
    expect(updatedUser.resetToken).toBeNull();
    expect(updatedUser.resetTokenExpiry).toBeNull();
  });

  it('should return 400 for invalid or expired token', async () => {
    const expiredToken = 'expiredtoken123';
    const expiredTokenExpiry = Date.now() - 3600000; // 1 hour ago (expired)

    await User.create({
      fullName: 'Expired Token User',
      email: 'expiredtoken@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'SalonOwner',
      resetToken: expiredToken,
      resetTokenExpiry: expiredTokenExpiry,
    });

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: expiredToken,
        newPassword: 'newpassword789',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid or expired reset token');
  });
});
