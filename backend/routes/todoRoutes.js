const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateTodo } = require('../middleware/validationMiddleware');
const todoController = require('../controllers/todoController');

router.get('/', authMiddleware, todoController.getAll);
router.post('/', authMiddleware, validateTodo, todoController.create);
router.put('/:id', authMiddleware, validateTodo, todoController.update);
router.delete('/:id', authMiddleware, todoController.delete);
router.delete('/', authMiddleware, todoController.clearCompleted);

module.exports = router;
