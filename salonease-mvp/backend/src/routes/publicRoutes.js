const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/salons/:salonId', publicController.getSalonPublicProfile);
router.get('/salons/:salonId/services', publicController.getSalonPublicServices);
router.get('/salons/:salonId/staff', publicController.getSalonPublicStaff);
router.get('/salons/:salonId/service-categories', publicController.getSalonServiceCategories);
router.get('/salons/:salonId/availability', publicController.checkSalonAvailability);
router.post('/salons/:salonId/bookings', publicController.createPublicBooking);

module.exports = router;
