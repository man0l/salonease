const express = require('express');
const router = express.Router();
const facebookController = require('../controllers/facebookController');

// Facebook event tracking routes
router.post('/events/lead', facebookController.trackLead);
router.post('/events/pageview', facebookController.trackPageView);
router.post('/events/start-trial', facebookController.trackStartTrial);

module.exports = router; 