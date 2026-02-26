const mongoose = require('mongoose');

const userBookSchema = new mongoose.Schema({
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
  currentPage: {
    type: Number,
    default: 0,
    min: 0
  },
  pagesRead: {
    type: Number,
    default: 0,
    min: 0
  },
  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  lastReadAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  firstOpenedAt: {
    type: Date,
    default: Date.now
  },
  readingSession: {
    type: Number,
    default: 0
  },
  month: {
    type: String, // Format: YYYY-MM
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-book per month
userBookSchema.index({ user: 1, book: 1, month: 1 }, { unique: true });

// Update book's total reads when a new user reads it
userBookSchema.post('save', async function() {
  if (this.isNew) {
    await mongoose.model('Book').updateOne(
      { _id: this.book },
      { $inc: { totalReads: 1 } }
    );
  }
});

module.exports = mongoose.model('UserBook', userBookSchema);