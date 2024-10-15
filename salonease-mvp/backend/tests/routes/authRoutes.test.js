const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/User');
const sequelize = require('../../src/config/db');

describe('POST /api/auth/register', () => {
  let createdUsers = [];

  beforeAll(async () => {
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
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123!',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Registration successful. Please check your email to verify your account.');

    // Track created user for cleanup
    const createdUser = await User.findOne({ where: { email: 'testuser@example.com' } });
    createdUsers.push(createdUser);
  });

  it('should not register a user with an existing email', async () => {
    const existingUser = await User.create({
      fullName: 'Existing User',
      email: 'existinguser@example.com',
      password: 'Password123!',
    });

    // Track created user for cleanup
    createdUsers.push(existingUser);

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
