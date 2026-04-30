const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const adminUserController = require('../controllers/adminUserController');

router.get('/', authMiddleware, requireRole(['admin']), adminUserController.list);
router.post('/:id/status', authMiddleware, requireRole(['admin']), adminUserController.setStatus);

module.exports = router;

