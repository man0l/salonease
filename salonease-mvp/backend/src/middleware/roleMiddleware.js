const jwt = require('jsonwebtoken');
const ROLES = require('../config/roles');

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    if (req.user.role !== ROLES.STAFF) {
      return next();
    }

    if (req.user.staff && !req.user.staff.salonId) {
      return res.status(403).json({ message: 'You are not associated with any salon' });
    }

    next();
  };
};

module.exports = roleMiddleware;
