const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Mathematics', 'Science', 'History', 'Literature', 'Computer Science', 
           'Physics', 'Chemistry', 'Biology', 'English', 'Arts', 'Geography', 'Other'],
    index: true
  },
  description: {
    type: String,
    required: true
  },
  totalPages: {
    type: Number,
    required: true,
    min: 1
  },
  coverImage: {
    type: String,
    required: true
  },
  pdfFile: {
    type: String,
    required: true
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  totalReads: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true
});

// Text search indexes
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);