const roleMiddleware = require('../../src/middleware/roleMiddleware');

describe('Role Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {
        role: 'SalonOwner'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next() if user role is allowed', () => {
    const middleware = roleMiddleware(['SalonOwner', 'Admin']);
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if user role is not allowed', () => {
    const middleware = roleMiddleware(['Admin']);
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access forbidden' });
  });

  it('should return 403 if user has no role', () => {
    req.user.role = undefined;
    const middleware = roleMiddleware(['SalonOwner']);
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access forbidden' });
  });
});
