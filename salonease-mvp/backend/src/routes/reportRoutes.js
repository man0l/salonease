const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Revenue reports
router.get(
  '/:salonId/revenue',
  authMiddleware,
  roleMiddleware(['SalonOwner']),
  reportsController.getRevenueReport
);

// Staff performance reports
router.get(
  '/:salonId/staff-performance',
  authMiddleware,
  roleMiddleware(['SalonOwner']),
  reportsController.getStaffPerformance
);

// Service breakdown reports
router.get(
  '/:salonId/service-breakdown',
  authMiddleware,
  roleMiddleware(['SalonOwner']),
  reportsController.getServiceBreakdown
);

// Add the export endpoint
router.get(
  '/:salonId/export',
  authMiddleware,
  roleMiddleware(['SalonOwner']),
  reportsController.exportReport
);

module.exports = router;