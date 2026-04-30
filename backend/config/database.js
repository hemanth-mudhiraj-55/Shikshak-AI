const bcrypt = require('bcryptjs');
const { withDb, makeRecord, normalizeEmail } = require('../lib/localStore');

async function ensureAdminUser() {
  await withDb(async (db) => {
    const existing = db.users.find(u => u.username === 'admin' || u.role === 'admin');
    if (existing) return;

    const hashedPassword = await bcrypt.hash('admin', 10);
    db.users.push(makeRecord({
      username: 'admin',
      email: normalizeEmail('admin@shikshak.local'),
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      accountStatus: 'active',
      profilePicture: null,
      phone: '',
      bio: '',
      preferences: {
        theme: 'system',
        notifications: { email: true, push: true },
        privacy: { readReceipts: true, onlineStatus: true },
        accessibility: { reduceMotion: false, highContrast: false }
      },
      lastLogin: null,
      monthlyBookLimit: 10,
      booksReadThisMonth: 0,
      totalPagesRead: 0,
      readingStreak: 0,
      lastReadDate: null,
      resetToken: null,
      resetTokenExpiry: null
    }));
  });
}

const connectDB = async () => {
  console.log('Using local JSON storage at backend/data/db.json');
  await ensureAdminUser();
  return { driver: 'local-json' };
};

module.exports = connectDB;
