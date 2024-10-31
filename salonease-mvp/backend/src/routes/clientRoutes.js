const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

router.use(authMiddleware);
router.use(roleMiddleware([ROLES.SALON_OWNER, ROLES.STAFF]));

router.get('/:salonId', clientController.getClients);
router.get('/:salonId/export', clientController.exportClients);
router.get('/:salonId/:clientId', clientController.getClient);
router.put('/:salonId/:clientId', clientController.updateClient);
router.post('/:salonId', clientController.addClient);
router.delete('/:salonId/:clientId', clientController.deleteClient);

module.exports = router;
