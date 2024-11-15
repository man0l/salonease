const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

router.get(
  '/salons/:salonId/dashboard/stats',
  authMiddleware,
  roleMiddleware([ROLES.SALON_OWNER]),
  dashboardController.getDashboardStats
);

router.get(
  '/salons/:salonId/dashboard/activity',
  authMiddleware,
  roleMiddleware([ROLES.SALON_OWNER]),
  dashboardController.getDashboardActivity
);

module.exports = router;
