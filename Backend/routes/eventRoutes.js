const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const Event = require('../models/Event');

// GET all events of user
router.get('/', authMiddleware, async (req, res) => {
  const events = await Event.find({ user: req.user._id }).sort({ date: 1 });
  res.json({ success: true, data: events });
});

// CREATE event
router.post('/', authMiddleware, async (req, res) => {
  const event = await Event.create({
    user: req.user._id,
    ...req.body
  });

  res.status(201).json({ success: true, data: event });
});

// DELETE event
router.delete('/:id', authMiddleware, async (req, res) => {
  await Event.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  res.json({ success: true });
});

module.exports = router;