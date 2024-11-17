const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get(
  '/salons/:salonId/revenue',
  authMiddleware,
  roleMiddleware(['SalonOwner']),
  reportsController.getRevenueReport
);

module.exports = router;