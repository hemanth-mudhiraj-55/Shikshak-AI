const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

router.get('/conversations', authMiddleware, messageController.getConversations);
router.get('/users', authMiddleware, messageController.getUsers);
router.get('/:partnerId', authMiddleware, messageController.getMessages);
router.post('/', authMiddleware, messageController.send);
router.delete('/:id', authMiddleware, messageController.delete);

module.exports = router;
