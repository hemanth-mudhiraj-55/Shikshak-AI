const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const botController = require('../controllers/botController');

router.use(authMiddleware);

router.get('/quota', botController.quota);
router.get('/memory', botController.memory);
router.post('/train', botController.train);

module.exports = router;

