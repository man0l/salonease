const { register, verifyEmail } = require('../../src/controllers/authController');
const User = require('../../src/models/User');
const httpMocks = require('node-mocks-http');
const sequelize = require('../../src/config/db');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../src/server');
const bcrypt = require('bcrypt');

describe('Auth Controller', () => {
  let req, res, next;
  let createdUsers = [];

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    process.env.JWT_SECRET = 'testsecret';
  });

  afterEach(async () => {
    // Cleanup: Remove only the users created during the tests
    for (const user of createdUsers) {
      await User.destroy({ where: { id: user.id } });
    }
    createdUsers = [];
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should register a new user successfully', async () => {
    req.body = {
      fullName: 'Test User',
      email: 'uniqueuser@example.com', // Ensure unique email
      password: 'Password123!',
    };

    await register(req, res, next);

    console.log('Response Status:', res.statusCode);
    console.log('Response Data:', res._getJSONData());

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: 'Registration successful. Please check your email to verify your account.',
    });

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
    console.log(existingUser);
    createdUsers.push(existingUser);

    await register(req, res, next);

    console.log('Response Status:', res.statusCode);
    console.log('Response Data:', res._getJSONData());

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'Email already exists' });
  });

  it('should not register a user with a weak password', async () => {
    req.body = {
      fullName: 'Test User',
      email: 'anotheruniqueuser@example.com', // Ensure unique email
      password: 'weakpass',
    };

    await register(req, res, next);

    console.log('Response Status:', res.statusCode);
    console.log('Response Data:', res._getJSONData());

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      message: 'Password must be at least 8 characters long and include uppercase letters, numbers, and special characters.',
    });
  });

  it('should verify email with valid token', async () => {
    const myuser = await User.create({
      fullName: 'Test User',
      email: 'verifyuser@example.com', // Ensure unique email
      password: 'Test@1234',
      isEmailVerified: false,
    });

    const token = jwt.sign({ userId: myuser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .get(`/api/auth/verify-email?token=${token}`)
      .expect(200);

    console.log('Response Status:', response.status);
    console.log('Response Data:', response.body);

    expect(response.body.message).toBe('Email verified successfully. You can now log in.');

    const updatedUser = await User.findByPk(myuser.id);
    expect(updatedUser.isEmailVerified).toBe(true);

    createdUsers.push(updatedUser);
  });

  it('should return error for invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/verify-email?token=invalidtoken')
      .expect(400);

    console.log('Response Status:', response.status);
    console.log('Response Data:', response.body);

    expect(response.body.message).toBe('Invalid or expired token');
  });

  it('should login successfully with valid credentials', async () => {
    const password = await bcrypt.hash('Test@1234', 10);
    const user = await User.create({
      fullName: 'Test User',
      email: 'loginuser@example.com', // Ensure unique email
      password,
      isEmailVerified: true,
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'loginuser@example.com',
        password: 'Test@1234',
      });

    console.log('Response Status:', response.status);
    console.log('Response Data:', response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('fullName', 'Test User');

    createdUsers.push(user);
  });

  it('should fail login with invalid credentials', async () => {
    const password = await bcrypt.hash('Test@1234', 10);
    const user = await User.create({
      fullName: 'Test User',
      email: 'invalidlogin@example.com', // Ensure unique email
      password,
      isEmailVerified: true,
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalidlogin@example.com',
        password: 'WrongPassword',
      });

    console.log('Response Status:', response.status);
    console.log('Response Data:', response.body);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid email or password');

    createdUsers.push(user);
  });

  it('should fail login if email is not verified', async () => {
    const password = await bcrypt.hash('Test@1234', 10);
    const user = await User.create({
      fullName: 'Non Verified User',
      email: 'nonverified@example.com', // Ensure unique email
      password,
      isEmailVerified: false,
    });
    createdUsers.push(user);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonverified@example.com',
        password: 'Test@1234',
      });

    console.log('Response Status:', response.status);
    console.log('Response Data:', response.body);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'Please verify your email before logging in');
  });
});
