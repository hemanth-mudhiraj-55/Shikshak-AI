const crypto = require('crypto');
const { withDb, makeRecord, normalizeEmail } = require('../lib/localStore');

class OTPService {
  // Generate 4-digit OTP
  generateOTP() {
    return crypto.randomInt(1000, 9999).toString();
  }

  // Create and save OTP
  async createOTP(email) {
    const normalizedEmail = normalizeEmail(email);
    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP expires in 5 minutes

    await withDb(async (db) => {
      db.otps = db.otps.filter(record => !(record.email === normalizedEmail && !record.isUsed));
      db.otps.push(makeRecord({
        email: normalizedEmail,
        otp,
        attempts: 0,
        isUsed: false,
        expiresAt: expiresAt.toISOString()
      }));
    });

    return otp;
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    const normalizedEmail = normalizeEmail(email);

    return withDb(async (db) => {
      const activeOtps = db.otps
        .filter(record => record.email === normalizedEmail)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const otpRecord = activeOtps.find(record =>
        record.otp === otp &&
        !record.isUsed &&
        new Date(record.expiresAt) > new Date()
      );

      if (!otpRecord) {
        const latestOTP = activeOtps.find(record => !record.isUsed);
        if (latestOTP) {
          latestOTP.attempts += 1;
          latestOTP.updatedAt = new Date().toISOString();
          if (latestOTP.attempts >= 3) {
            latestOTP.isUsed = true;
          }
        }

        return {
          isValid: false,
          message: 'Invalid or expired OTP'
        };
      }

      if (otpRecord.attempts >= 3) {
        otpRecord.isUsed = true;
        otpRecord.updatedAt = new Date().toISOString();
        return {
          isValid: false,
          message: 'Maximum OTP attempts reached'
        };
      }

      otpRecord.isUsed = true;
      otpRecord.attempts += 1;
      otpRecord.updatedAt = new Date().toISOString();

      return {
        isValid: true,
        message: 'OTP verified successfully'
      };
    });
  }

  // Check if user can request new OTP
  async canRequestOTP(email) {
    const normalizedEmail = normalizeEmail(email);
    const { readDb } = require('../lib/localStore');
    const db = await readDb();
    const cutoff = Date.now() - 60 * 1000;
    const recentOTP = db.otps.find(record =>
      record.email === normalizedEmail &&
      new Date(record.createdAt).getTime() > cutoff
    );

    return !recentOTP;
  }

  // Get OTP attempts count
  async getOTPAttempts(email) {
    const { readDb } = require('../lib/localStore');
    const db = await readDb();
    const normalizedEmail = normalizeEmail(email);
    const latestOTP = db.otps
      .filter(record => record.email === normalizedEmail && !record.isUsed)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return latestOTP ? latestOTP.attempts : 0;
  }
}

module.exports = new OTPService();
