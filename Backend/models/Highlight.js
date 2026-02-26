const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true
  },
  page: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#fef3c7'
  },
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for quick retrieval
highlightSchema.index({ user: 1, book: 1, page: 1 });

module.exports = mongoose.model('Highlight', highlightSchema);