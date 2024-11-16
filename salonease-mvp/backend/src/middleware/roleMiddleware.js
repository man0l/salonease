const jwt = require('jsonwebtoken');
const ROLES = require('../config/roles');
const { Salon } = require('../config/db');
const Staff = require('../config/db').Staff;

const roleMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    if (!req.params) {
      return next();
    }

    const { salonId } = req.params;

    if (req.user.role === ROLES.SALON_OWNER && salonId) {
      const salon = await Salon.findOne({ where: { id: salonId, ownerId: req.user.id } });
      if (!salon) {
        return res.status(403).json({ message: 'You do not have permission to access this salon as a salon owner' });
      }
    }

    if (req.user.role === ROLES.STAFF && salonId) {
      const staff = await Staff.findOne({ where: { userId: req.user.id, salonId: salonId } });
      if (!staff) {
        return res.status(403).json({ message: 'You do not have permission to access this salon as a staff member' });
      }
      req.staffMember = staff;
    }

    next();
  };
};

module.exports = roleMiddleware;
