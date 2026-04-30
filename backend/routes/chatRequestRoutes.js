const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const chatRequestController = require('../controllers/chatRequestController');

router.use(authMiddleware);

router.get('/inbox', chatRequestController.inbox);
router.get('/sent', chatRequestController.sent);
router.post('/', chatRequestController.create);
router.post('/:id/accept', chatRequestController.accept);
router.post('/:id/reject', chatRequestController.reject);

module.exports = router;

