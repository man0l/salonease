const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Define allowed roles for staff management
const allowedRoles = ['SuperAdmin', 'SalonOwner'];

// Apply roleMiddleware to all staff routes
router.use(roleMiddleware(allowedRoles));

router.get('/:salonId/staff', staffController.getStaff);
router.post('/:salonId/staff/invite', staffController.inviteStaff);
router.put('/:salonId/staff/:staffId', staffController.updateStaff);
router.delete('/:salonId/staff/:staffId', staffController.deleteStaff);

module.exports = router;
