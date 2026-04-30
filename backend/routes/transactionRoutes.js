const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

router.get('/', authMiddleware, transactionController.getAll);
router.get('/stats', authMiddleware, transactionController.getStats);
router.post('/', authMiddleware, transactionController.create);

module.exports = router;
