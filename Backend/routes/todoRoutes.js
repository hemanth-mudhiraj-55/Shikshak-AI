const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const Todo = require('../models/Todo');

// GET all todos of logged-in user
router.get('/', authMiddleware, async (req, res) => {
  const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: todos });
});

// CREATE new todo
router.post('/', authMiddleware, async (req, res) => {
  const { text, priority, dueDate } = req.body;

  const todo = await Todo.create({
    user: req.user._id,
    text,
    priority,
    dueDate
  });

  res.status(201).json({ success: true, data: todo });
});

// UPDATE todo
router.put('/:id', authMiddleware, async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );

  res.json({ success: true, data: todo });
});

// DELETE todo
router.delete('/:id', authMiddleware, async (req, res) => {
  await Todo.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  res.json({ success: true });
});

module.exports = router;