const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

router.use(authMiddleware);
router.use(roleMiddleware([ROLES.SALON_OWNER, ROLES.STAFF]));

router.get('/salons/:salonId/clients', clientController.getClients);
router.get('/salons/:salonId/clients/:clientId', clientController.getClient);
router.put('/salons/:salonId/clients/:clientId', clientController.updateClient);
router.get('/salons/:salonId/clients/export', clientController.exportClients);
router.post('/salons/:salonId/clients', clientController.addClient);

module.exports = router;
