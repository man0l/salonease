const { register, verifyEmail, login, refreshToken: refreshTokenAction, logout, forgotPassword, completeOnboarding, updateUser } = require('../../src/controllers/authController');
const { User, RefreshToken: RefreshTokenModel, sequelize } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const SubscriptionService = require('../../src/services/subscriptionService');
const subscriptionService = SubscriptionService.getInstance();

// Mock the services
jest.mock('../../src/services/subscriptionService', () => {
  const mockStartTrialSubscription = jest.fn().mockResolvedValue(true);
  const mockSubscriptionService = jest.fn().mockImplementation(() => ({
    startTrialSubscription: mockStartTrialSubscription,
    getSubscriptionStatus: jest.fn().mockResolvedValue({
      isActive: true,
      usage: 0,
      limit: 100
    }),
    addBookingCharge: jest.fn().mockResolvedValue(true)
  }));
  
  // Expose the mock function for testing
  mockSubscriptionService.mockStartTrialSubscription = mockStartTrialSubscription;
  return mockSubscriptionService;
});

// mock the emailHelper
jest.mock('../../src/utils/helpers/emailHelper', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(),
}));

// Mock multer
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req, res, next) => {
      req.file = {
        filename: 'test-image.jpg',
        path: '/uploads/profiles/test-image.jpg'
      };
      next();
    },
    array: () => (req, res, next) => {
      req.files = [{
        filename: 'test-image-1.jpg',
        path: '/uploads/profiles/test-image-1.jpg'
      }, {
        filename: 'test-image-2.jpg',
        path: '/uploads/profiles/test-image-2.jpg'
      }];
      next();
    }
  });
  
  multer.diskStorage = () => ({
    destination: (req, file, cb) => cb(null, '/uploads/profiles'),
    filename: (req, file, cb) => cb(null, 'test-image.jpg')
  });
  
  return multer;
});

// Mock stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_mock123' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'cus_mock123' })
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({ id: 'sub_mock123' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'sub_mock123' }),
      update: jest.fn().mockResolvedValue({ id: 'sub_mock123' })
    },
    paymentMethods: {
      attach: jest.fn().mockResolvedValue({ id: 'pm_mock123' })
    }
  }));
});

const emailHelper = require('../../src/utils/helpers/emailHelper');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(async () => {
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
    it('should complete onboarding successfully', async () => {
      const user = await User.create({
        fullName: 'Test User',
        email: 'onboarding@example.com',
        password: await bcrypt.hash('Test@1234', 10),
        isEmailVerified: true,
        onboardingCompleted: false
      });

      req.user = { id: user.id };

      const subscriptionService = require('../../src/services/subscriptionService');
      const mockStartTrialSubscription = subscriptionService.mockStartTrialSubscription;

      await completeOnboarding(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'Onboarding completed successfully'
      });

      expect(mockStartTrialSubscription).toHaveBeenCalledWith(user.id);

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.onboardingCompleted).toBe(true);
    });

    it('should handle database errors when updating user', async () => {
      const user = await User.create({
        fullName: 'DB Error User',
        email: 'dberror@example.com',
        password: await bcrypt.hash('Test@1234', 10),
        isEmailVerified: true,
        onboardingCompleted: false
      });

      req.user = { id: user.id };

      jest.spyOn(User, 'update').mockRejectedValueOnce(new Error('Database error'));

      await completeOnboarding(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: 'Database error'
      });

      jest.restoreAllMocks();
    });

    it('should handle undefined user in request', async () => {
      req.user = undefined;

      await completeOnboarding(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: 'User information is required'
      });
    });

    it('should handle missing user ID in request', async () => {
      req.user = {};

      await completeOnboarding(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: 'User information is required'
      });
    });
  });

  describe('updateUser', () => {
    it('should update user with image successfully', async () => {
      const user = await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });

      const req = httpMocks.createRequest({
        user: { id: user.id },
        body: { fullName: 'Updated Name' },
        file: {
          filename: 'test-image.jpg'
        }
      });
      const res = httpMocks.createResponse();

      await updateUser(req, res);

      expect(res.statusCode).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData.fullName).toBe('Updated Name');
      expect(responseData.image).toBe('/uploads/profiles/test-image.jpg');

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.image).toBe('/uploads/profiles/test-image.jpg');
    });

    it('should update user without image successfully', async () => {
      const user = await User.create({
        fullName: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: await bcrypt.hash('password123', 10),
        isEmailVerified: true,
      });

      const req = httpMocks.createRequest({
        user: { id: user.id },
        body: { fullName: 'Updated Name' }
      });
      const res = httpMocks.createResponse();

      await updateUser(req, res);

      expect(res.statusCode).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData.fullName).toBe('Updated Name');
      expect(responseData.image).toBeNull();

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.fullName).toBe('Updated Name');
    });
  });
});
