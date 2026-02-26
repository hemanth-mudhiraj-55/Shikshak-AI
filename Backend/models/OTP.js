const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: 4
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '5m' } // Auto delete after 5 minutes
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
otpSchema.index({ email: 1, createdAt: -1 });

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;