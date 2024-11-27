const { register, verifyEmail, login, refreshToken: refreshTokenAction, logout, forgotPassword, completeOnboarding } = require('../../src/controllers/authController');
const { User, RefreshToken: RefreshTokenModel, sequelize } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const subscriptionService = require('../../src/services/subscriptionService');

// Mock the services
jest.mock('../../src/services/subscriptionService');

// mock the emailHelper
jest.mock('../../src/utils/helpers/emailHelper', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(),
}));

const emailHelper = require('../../src/utils/helpers/emailHelper');
describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    process.env.JWT_SECRET = 'testsecret';
    // Clear all mocks before each test
    jest.clearAllMocks();
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

      // Check if the sendVerificationEmail function was called
      expect(emailHelper.sendVerificationEmail).toHaveBeenCalledWith(
        req.body.email,
        expect.any(String)
      );
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

  describe('forgotPassword', () => {
    it('should send a password reset email', async () => {
      const user = await User.create({
        fullName: 'Forgot Password User',
        email: 'forgotpassword@example.com',
        password: await bcrypt.hash('OldPassword123!', 10),
        isEmailVerified: true,
      });

      req.body = {
        email: 'forgotpassword@example.com',
      };

      await forgotPassword(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().message).toBe('Password reset email sent');
      // Add this assertion to check if the sendPasswordResetEmail function was called
      expect(emailHelper.sendPasswordResetEmail).toHaveBeenCalledWith(
        req.body.email,
        expect.any(String)
      );
    });

    // ... (other forgotPassword tests)
  });

  describe('completeOnboarding', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      User.update = jest.fn().mockResolvedValue([1]);
      subscriptionService.startTrialSubscription = jest.fn().mockResolvedValue();
    });

    it('should complete onboarding successfully', async () => {
      // create user
      const user = await User.create({
        fullName: 'Forgot Password User',
        email: 'forgotpassword@example.com',
        password: await bcrypt.hash('OldPassword123!', 10),
        isEmailVerified: true,
      });

      const req = { user: { userId: user.id } };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await completeOnboarding(req, res);
      
      // Verify subscription service was called
      expect(subscriptionService.startTrialSubscription).toHaveBeenCalledWith(user.id);
      
      // Verify user update was called
      expect(User.update).toHaveBeenCalledWith(
        { onboardingCompleted: true },
        expect.objectContaining({
          where: { id: user.id }
        })
      );
      
      // Verify response
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Onboarding completed successfully' 
      });
    });

    it('should handle onboarding error and rollback transaction', async () => {
      const req = { user: { userId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };

      sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
      subscriptionService.startTrialSubscription = jest.fn().mockRejectedValue(new Error('Subscription error'));

      await completeOnboarding(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Subscription error' });
    });
  });
});
