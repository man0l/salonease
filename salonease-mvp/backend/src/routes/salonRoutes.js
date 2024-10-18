const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['SuperAdmin', 'SalonOwner']));

router.post('/', salonController.createSalon);
router.get('/', salonController.getSalons);
router.put('/:id', salonController.updateSalon);
router.delete('/:id', salonController.deleteSalon);

module.exports = router;
