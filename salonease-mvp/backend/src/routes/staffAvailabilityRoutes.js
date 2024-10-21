const express = require('express');
const router = express.Router({ mergeParams: true });
const staffAvailabilityController = require('../controllers/staffAvailabilityController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

router.use(authMiddleware);

router.get('/', 
  roleMiddleware([ROLES.SALON_OWNER, ROLES.STAFF]), 
  staffAvailabilityController.getStaffAvailability
);

router.post('/', 
  roleMiddleware([ROLES.SALON_OWNER]), 
  staffAvailabilityController.createOrUpdateStaffAvailability
);

router.delete('/:availabilityId', 
  roleMiddleware([ROLES.SALON_OWNER]), 
  staffAvailabilityController.deleteStaffAvailability
);

module.exports = router;
