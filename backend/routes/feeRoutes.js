const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const feeController = require('../controllers/feeController');

router.get('/overview', authMiddleware, feeController.getOverview);
router.get('/invoices', authMiddleware, feeController.listInvoices);
router.get('/payments', authMiddleware, feeController.listPayments);
router.post('/invoices/:id/pay', authMiddleware, feeController.payInvoice);

module.exports = router;

