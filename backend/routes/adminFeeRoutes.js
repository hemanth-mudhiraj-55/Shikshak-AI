const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const adminFeeController = require('../controllers/adminFeeController');

router.get('/invoices', authMiddleware, requireRole(['admin']), adminFeeController.listInvoices);
router.post('/invoices', authMiddleware, requireRole(['admin']), adminFeeController.createInvoice);
router.post('/invoices/:id/void', authMiddleware, requireRole(['admin']), adminFeeController.voidInvoice);

module.exports = router;

