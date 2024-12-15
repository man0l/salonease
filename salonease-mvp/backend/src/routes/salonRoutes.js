const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');
const { uploadMultiple } = require('../utils/imageUpload');

router.use(authMiddleware);
router.use(roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SALON_OWNER]));

router.post('/', uploadMultiple, salonController.createSalon);
router.get('/', salonController.getSalons);
router.post('/:id', uploadMultiple, salonController.updateSalon);
router.delete('/:id', salonController.deleteSalon);
router.post('/:id/restore', salonController.restoreSalon);

module.exports = router;
