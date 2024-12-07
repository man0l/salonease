const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:salonId/invoices', authMiddleware, invoiceController.getInvoices);
router.get('/:salonId/invoices/:invoiceId/download', authMiddleware, invoiceController.downloadInvoice);
router.get('/:salonId/subscription', authMiddleware, invoiceController.getSubscriptionDetails);

module.exports = router; 