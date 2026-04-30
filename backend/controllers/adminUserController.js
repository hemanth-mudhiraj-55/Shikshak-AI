const { readDb, withDb, touchRecord } = require('../lib/localStore');

function sanitize(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    lastLogin: user.lastLogin || null,
    createdAt: user.createdAt,
    teacherRequests: Number(user.teacherRequests || 0)
  };
}

class AdminUserController {
  async list(req, res) {
    try {
      const q = String(req.query.query || '').trim().toLowerCase();
      const db = await readDb();
      let users = (db.users || []).filter(user => user.role === 'user');
      if (q) {
        users = users.filter(user =>
          String(user.username || '').toLowerCase().includes(q) ||
          String(user.email || '').toLowerCase().includes(q)
        );
      }

      const teacherRequestCount = new Map();
      (db.teachers || []).forEach((teacher) => {
        teacherRequestCount.set(teacher.addedBy, (teacherRequestCount.get(teacher.addedBy) || 0) + 1);
      });

      const data = users
        .map(user => sanitize({ ...user, teacherRequests: teacherRequestCount.get(user._id) || 0 }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ success: true, data });
    } catch (error) {
      console.error('Admin list users error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  }

  async setStatus(req, res) {
    try {
      const id = req.params.id;
      const nextStatus = String(req.body?.accountStatus || '').trim();
      if (!['active', 'inactive'].includes(nextStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid account status' });
      }

      let updated;
      await withDb(async (db) => {
        updated = (db.users || []).find(user => user._id === id && user.role === 'user');
        if (!updated) return;
        updated.accountStatus = nextStatus;
        Object.assign(updated, touchRecord(updated));
      });

      if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, data: sanitize(updated) });
    } catch (error) {
      console.error('Admin set user status error:', error);
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  }
}

module.exports = new AdminUserController();

