const { register, verifyEmail, login, refreshToken: refreshTokenAction, logout } = require('../../src/controllers/authController');
const { User, RefreshToken: RefreshTokenModel, sequelize } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

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
    it('should login successfully with valid credentials and return both JWT and refresh tokens', async () => {
      const password = await bcrypt.hash('Test@1234', 10);
      const user = await User.create({
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
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('token');
      expect(responseData).toHaveProperty('refreshToken');
      expect(responseData.user).toHaveProperty('fullName', 'Test User');

      // Verify that a refresh token was created in the database
      const storedRefreshToken = await RefreshTokenModel.findOne({ where: { userId: user.id } });
      expect(storedRefreshToken).not.toBeNull();
      expect(storedRefreshToken.token).toBe(responseData.refreshToken);
    });

    // Add more login tests...
  });

  describe('refreshToken', () => {
    it('should issue a new JWT token with a valid refresh token', async () => {
      const user = await User.create({
        fullName: 'Refresh User',
        email: 'refreshuser@example.com',
        password: await bcrypt.hash('Test@1234', 10),
        isEmailVerified: true,
      });

      const refreshTokenValue = uuidv4();
      await RefreshTokenModel.create({
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });

      req.body = {
        refreshToken: refreshTokenValue,
      };

      await refreshTokenAction(req, res);

      expect(res.statusCode).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('token');
      
      // Verify the new JWT token
      const decodedToken = jwt.verify(responseData.token, process.env.JWT_SECRET);
      expect(decodedToken.userId).toBe(user.id);
    });

    it('should return 401 with an invalid refresh token', async () => {
      req.body = {
        refreshToken: 'invalidrefreshtoken',
      };

      await refreshTokenAction(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData().message).toBe('Invalid or expired refresh token');
    });
  });

  describe('logout', () => {
    it('should invalidate the refresh token on logout', async () => {
      const user = await User.create({
        fullName: 'Logout User',
        email: 'logoutuser@example.com',
        password: await bcrypt.hash('Test@1234', 10),
        isEmailVerified: true,
      });

      const refreshTokenValue = uuidv4();
      await RefreshTokenModel.create({
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });

      req.body = {
        refreshToken: refreshTokenValue,
      };

      await logout(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().message).toBe('Logged out successfully');

      // Verify that the refresh token was removed from the database
      const storedRefreshToken = await RefreshTokenModel.findOne({ where: { token: refreshTokenValue } });
      expect(storedRefreshToken).toBeNull();
    });
  });
});
