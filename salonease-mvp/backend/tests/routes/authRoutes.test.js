const request = require('supertest');
const app = require('../../src/server');
const { User } = require('../setupTests');

describe('POST /api/auth/register', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
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

    const createdUser = await User.findOne({ where: { email: 'testuser@example.com' } });
    expect(createdUser).not.toBeNull();
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
