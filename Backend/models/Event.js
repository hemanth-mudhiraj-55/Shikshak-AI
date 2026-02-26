const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: String,
  type: {
    type: String,
    enum: ['meeting', 'deadline', 'task', 'reminder'],
    default: 'meeting'
  },
  description: String,
  location: String
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);