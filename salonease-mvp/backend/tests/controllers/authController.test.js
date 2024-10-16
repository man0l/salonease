const { register, verifyEmail, login } = require('../../src/controllers/authController');
const { User } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        fullName: 'Test User',
        email: 'uniqueuser@example.com',
        password: 'Password123!',
      };

      await register(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual({
        message: 'Registration successful. Please check your email to verify your account.',
      });

      const newUser = await User.findOne({ where: { email: req.body.email } });
      expect(newUser).not.toBeNull();
    });

    // Add more register tests...
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const user = await User.create({
        fullName: 'Test User',
        email: 'verifyuser@example.com',
        password: 'Test@1234',
        isEmailVerified: false,
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      req.query = { token };

      await verifyEmail(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().message).toBe('Email verified successfully. You can now log in.');

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.isEmailVerified).toBe(true);
    });

    // Add more verifyEmail tests...
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const password = await bcrypt.hash('Test@1234', 10);
      await User.create({
        fullName: 'Test User',
        email: 'loginuser@example.com',
        password,
        isEmailVerified: true,
      });

      req.body = {
        email: 'loginuser@example.com',
        password: 'Test@1234',
      };

      await login(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty('token');
      expect(res._getJSONData().user).toHaveProperty('fullName', 'Test User');
    });

    // Add more login tests...
  });
});
