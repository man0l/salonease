const { register } = require('../../src/controllers/authController');
const User = require('../../src/models/User');
const httpMocks = require('node-mocks-http');
const sequelize = require('../../src/config/db');

jest.mock('../../src/models/User');

describe('Auth Controller - Register', () => {
  let req, res, next;
  let createdUsers = [];

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

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 1, ...req.body });

    await register(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: 'Registration successful. Please check your email to verify your account.',
    });

    // Track created user for cleanup
    createdUsers.push({ id: 1 });
  });

  it('should not register a user with an existing email', async () => {
    req.body = {
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
    };

    User.findOne.mockResolvedValue({ id: 1, ...req.body });

    await register(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'Email already exists' });
  });
});
