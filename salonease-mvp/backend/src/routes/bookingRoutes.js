const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const manychatWebhookMiddleware = require('../middleware/manychatWebhookMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');

const ROLES = require('../config/roles');

router.post('/manychat',
  apiKeyMiddleware,
  manychatWebhookMiddleware,
  rateLimitMiddleware,
  bookingController.createManychatBooking
); 

router.use(authMiddleware);

// Get all bookings for a salon
router.get('/:salonId', 
  roleMiddleware([ROLES.SALON_OWNER, ROLES.STAFF]), 
  bookingController.getBookings
);

// Create a new booking
router.post('/:salonId', 
  roleMiddleware([ROLES.SALON_OWNER, ROLES.STAFF]), 
  bookingController.createBooking
);

// Update a booking
router.put('/:salonId/:bookingId', 
  roleMiddleware([ROLES.SALON_OWNER, ROLES.STAFF]), 
  bookingController.updateBooking
);

// Cancel a booking
router.delete('/:salonId/:bookingId', 
  roleMiddleware([ROLES.SALON_OWNER, ROLES.STAFF]), 
  bookingController.deleteBooking
);

module.exports = router; 