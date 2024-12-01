const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

router.use(authMiddleware);
router.use(roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SALON_OWNER]));

router.post('/', salonController.createSalon);
router.get('/', salonController.getSalons);
router.put('/:id', salonController.updateSalon);
router.delete('/:id', salonController.deleteSalon);
router.post('/:id/restore', salonController.restoreSalon);

module.exports = router;
