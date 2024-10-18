const jwt = require('jsonwebtoken');

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    console.log('Allowed roles:', allowedRoles); // Add this line
    console.log('User role:', req.user.role); // Add this line

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      console.log('Access forbidden. User role not in allowed roles.'); // Add this line
      return res.status(403).json({ message: 'Access forbidden' });
    }

    next();
  };
};

module.exports = roleMiddleware;
