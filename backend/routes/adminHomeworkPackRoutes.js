const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const adminHomeworkPackController = require('../controllers/adminHomeworkPackController');

router.use(authMiddleware);
router.use(requireRole(['admin']));

router.get('/packs', adminHomeworkPackController.list);
router.post('/packs', adminHomeworkPackController.create);
router.put('/packs/:id', adminHomeworkPackController.update);
router.delete('/packs/:id', adminHomeworkPackController.remove);

module.exports = router;

