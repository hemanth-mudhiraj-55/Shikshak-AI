const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'teacher'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  profilePicture: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // Book management fields
  monthlyBookLimit: {
    type: Number,
    default: 10
  },
  booksReadThisMonth: {
    type: Number,
    default: 0
  },
  totalPagesRead: {
    type: Number,
    default: 0
  },
  readingStreak: {
    type: Number,
    default: 0
  },
  lastReadDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save hook for password hashing
userSchema.pre('save', async function () {
  try {
    if (!this.isModified('password')) {
      return;
    }

    console.log('🔐 Hashing password for user:', this.email);

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    console.log('✅ Password hashed successfully');
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    throw error;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('❌ Error comparing password:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);