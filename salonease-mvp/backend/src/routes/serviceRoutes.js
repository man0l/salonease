const express = require('express');
const { createService, getServices, updateService, deleteService } = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/:salonId', authMiddleware, roleMiddleware(['SalonOwner']), createService);
router.get('/:salonId', authMiddleware, getServices);
router.put('/:id', authMiddleware, roleMiddleware(['SalonOwner']), updateService);
router.delete('/:id', authMiddleware, roleMiddleware(['SalonOwner']), deleteService);

module.exports = router;
