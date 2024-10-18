const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Define allowed roles for staff management
const allowedRoles = ['SuperAdmin', 'SalonOwner'];

// Public route for accepting invitations
router.post('/accept-invitation', staffController.acceptInvitation);

// Apply authMiddleware and roleMiddleware to protected routes
router.use(authMiddleware);
router.use(roleMiddleware(allowedRoles));

// Protected routes
router.get('/:salonId/staff', staffController.getStaff);
router.post('/:salonId/staff/invite', staffController.inviteStaff);
router.put('/:salonId/staff/:staffId', staffController.updateStaff);
router.delete('/:salonId/staff/:staffId', staffController.deleteStaff);

module.exports = router;
