const express = require('express');
const router = express.Router();
const SubscriptionService = require('../services/subscriptionService');
const subscriptionService = new SubscriptionService();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

router.post('/increment-base', [
    authMiddleware, 
    roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SALON_OWNER])
], async (req, res) => {
  try {
    const result = await subscriptionService.incrementBasePrice(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/add-booking-charge', [
    authMiddleware, 
    roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SALON_OWNER, ROLES.STAFF])
], async (req, res) => {
  try {
    const result = await subscriptionService.addBookingCharge(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 