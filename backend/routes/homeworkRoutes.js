const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const homeworkController = require('../controllers/homeworkController');

router.get('/', authMiddleware, homeworkController.getAll);
router.post('/', authMiddleware, homeworkController.create);
router.put('/:id', authMiddleware, homeworkController.update);
router.delete('/:id', authMiddleware, homeworkController.delete);

module.exports = router;
