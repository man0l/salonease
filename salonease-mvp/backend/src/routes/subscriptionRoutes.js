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

router.post('/setup-intent', authMiddleware, async (req, res) => {
  try {
    const setupIntent = await subscriptionService.createSetupIntent(req.user.id);
    res.json(setupIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/attach-payment-method', authMiddleware, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    await subscriptionService.attachPaymentMethod(req.user.id, paymentMethodId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 