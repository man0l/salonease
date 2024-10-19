const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

// Apply authMiddleware to all routes
router.use(authMiddleware);

router.get('/my-salon', roleMiddleware([ROLES.STAFF]), staffController.getAssociatedSalon);

// Protected routes for staff management
router.get('/:salonId', roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SALON_OWNER]), staffController.getStaff);
router.post('/:salonId/invite', roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SALON_OWNER]), staffController.inviteStaff);
router.put('/:salonId/:staffId', roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SALON_OWNER]), staffController.updateStaff);

// Only salon owners can delete staff
router.delete('/:salonId/staff/:staffId', roleMiddleware([ROLES.SALON_OWNER]), staffController.deleteStaff);

module.exports = router;
