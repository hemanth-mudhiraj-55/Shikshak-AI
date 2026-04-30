const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const homeworkPackController = require('../controllers/homeworkPackController');

router.use(authMiddleware);

router.get('/packs', homeworkPackController.listAssigned);
router.get('/packs/:id', homeworkPackController.getPackForAttempt);
router.post('/packs/:id/attempt', homeworkPackController.submitAttempt);

module.exports = router;

