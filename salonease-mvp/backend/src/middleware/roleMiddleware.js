const jwt = require('jsonwebtoken');
const ROLES = require('../config/roles');
const { Salon } = require('../config/db');

const roleMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    if (req.user.role === ROLES.SALON_OWNER) {
      const { salonId } = req.params;
      if (salonId) {
        const salon = await Salon.findOne({ where: { id: salonId, ownerId: req.user.id } });
        if (!salon) {
          return res.status(403).json({ message: 'You do not have permission to access this salon' });
        }
      }
    } else if (req.user.role === ROLES.STAFF) {
      if (req.user.staff && req.user.staff.salonId !== req.params.salonId) {
        return res.status(403).json({ message: 'You do not have permission to access this salon' });
      }
    }

    next();
  };
};

module.exports = roleMiddleware;
