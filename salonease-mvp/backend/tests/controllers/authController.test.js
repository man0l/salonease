const { register, verifyEmail } = require('../../src/controllers/authController');
const User = require('../../src/models/User');
const httpMocks = require('node-mocks-http');
const sequelize = require('../../src/config/db');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../src/server');

describe('Auth Controller - Register', () => {
  let req, res, next;
  let createdUsers = [];

  beforeAll(async () => {
    await sequelize.sync(); // Ensure sync does not use force: true
  });

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    process.env.JWT_SECRET = 'testsecret'; // Ensure JWT_SECRET is set
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

  it('should register a new user successfully', async () => {
    req.body = {
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    };

    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      await existingUser.destroy();
    }

    await register(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: 'Registration successful. Please check your email to verify your account.',
    });

    // Track created user for cleanup
    const newUser = await User.findOne({ where: { email: req.body.email } });
    createdUsers.push(newUser);
  });

  it('should not register a user with an existing email', async () => {
    req.body = {
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    };

    const existingUser = await User.create(req.body);
    createdUsers.push(existingUser);

    await register(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'Email already exists' });
  });

  it('should not register a user with a weak password', async () => {
    req.body = {
      fullName: 'Test User',
      email: 'newuser@example.com',
      password: 'weakpass', // Weak password
    };

    await register(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      message: 'Password must be at least 8 characters long and include uppercase letters, numbers, and special characters.',
    });
  });

  it('should verify email with valid token', async () => {
    const user = await User.create({
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: 'Test@1234',
      isEmailVerified: false,
    });

    // Generate a valid token
    token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .get(`/api/auth/verify-email?token=${token}`)
      .expect(200);

    expect(response.body.message).toBe('Email verified successfully. You can now log in.');

    // Check if the user's email is marked as verified
    const updatedUser = await User.findByPk(user.id);
    expect(updatedUser.isEmailVerified).toBe(true);

    // Cleanup: Remove the user created during the test
    createdUsers.push(updatedUser);
  });

  it('should return error for invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/verify-email?token=invalidtoken')
      .expect(400);

    expect(response.body.message).toBe('Invalid or expired token');
  });
});
