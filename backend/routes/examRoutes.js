const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const examController = require('../controllers/examController');

router.get('/', authMiddleware, examController.getAll);
router.post('/', authMiddleware, examController.create);
router.put('/:id', authMiddleware, examController.update);
router.delete('/:id', authMiddleware, examController.delete);

module.exports = router;
