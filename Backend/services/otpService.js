const crypto = require('crypto');
const OTP = require('../models/OTP');

class OTPService {
  // Generate 4-digit OTP
  generateOTP() {
    return crypto.randomInt(1000, 9999).toString();
  }

  // Create and save OTP
  async createOTP(email) {
    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, isUsed: false });
    
    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP expires in 5 minutes

    const otpRecord = new OTP({
      email,
      otp,
      expiresAt
    });

    await otpRecord.save();
    return otp;
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      // Increment attempts for the latest OTP
      const latestOTP = await OTP.findOne({
        email: email.toLowerCase(),
        isUsed: false
      }).sort({ createdAt: -1 });

      if (latestOTP) {
        latestOTP.attempts += 1;
        if (latestOTP.attempts >= 3) {
          latestOTP.isUsed = true; // Mark as used if max attempts reached
        }
        await latestOTP.save();
      }

      return {
        isValid: false,
        message: 'Invalid or expired OTP'
      };
    }

    // Check if max attempts reached
    if (otpRecord.attempts >= 3) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return {
        isValid: false,
        message: 'Maximum OTP attempts reached'
      };
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    otpRecord.attempts += 1;
    await otpRecord.save();

    return {
      isValid: true,
      message: 'OTP verified successfully'
    };
  }

  // Check if user can request new OTP
  async canRequestOTP(email) {
    const recentOTP = await OTP.findOne({
      email: email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // Last 60 seconds
    });

    return !recentOTP; // Can request if no OTP sent in last 60 seconds
  }

  // Get OTP attempts count
  async getOTPAttempts(email) {
    const latestOTP = await OTP.findOne({
      email: email.toLowerCase(),
      isUsed: false
    }).sort({ createdAt: -1 });

    return latestOTP ? latestOTP.attempts : 0;
  }
}

module.exports = new OTPService();