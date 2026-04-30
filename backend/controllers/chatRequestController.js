const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');

const normalize = (v) => String(v || '').trim();

function isBlocked(db, a, b) {
  return db.blocks.some(entry =>
    (entry.blocker === a && entry.blocked === b) ||
    (entry.blocker === b && entry.blocked === a)
  );
}

function hasAccepted(db, a, b) {
  return db.chatRequests.some(r =>
    ((r.sender === a && r.receiver === b) || (r.sender === b && r.receiver === a)) &&
    r.status === 'accepted'
  );
}

class ChatRequestController {
  async inbox(req, res) {
    try {
      const db = await readDb();
      const userId = req.user._id;
      const pending = db.chatRequests
        .filter(r => r.receiver === userId && r.status === 'pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(r => {
          const sender = db.users.find(u => u._id === r.sender);
          return {
            _id: r._id,
            sender: sender ? { _id: sender._id, username: sender.username, email: sender.email } : { _id: r.sender, username: 'Unknown', email: '' },
            message: r.message || '',
            status: r.status,
            createdAt: r.createdAt
          };
        });
      res.json({ success: true, data: pending });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch inbox requests' });
    }
  }

  async sent(req, res) {
    try {
      const db = await readDb();
      const userId = req.user._id;
      const items = db.chatRequests
        .filter(r => r.sender === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(r => {
          const receiver = db.users.find(u => u._id === r.receiver);
          return {
            _id: r._id,
            receiver: receiver ? { _id: receiver._id, username: receiver.username, email: receiver.email } : { _id: r.receiver, username: 'Unknown', email: '' },
            message: r.message || '',
            status: r.status,
            createdAt: r.createdAt
          };
        });
      res.json({ success: true, data: items });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch sent requests' });
    }
  }

  async create(req, res) {
    try {
      const receiverId = normalize(req.body.receiverId);
      const message = normalize(req.body.message);
      if (!receiverId) {
        return res.status(400).json({ success: false, message: 'receiverId is required' });
      }
      if (receiverId === req.user._id) {
        return res.status(400).json({ success: false, message: 'Cannot request yourself' });
      }

      let created;
      await withDb(async (db) => {
        if (isBlocked(db, req.user._id, receiverId)) {
          created = { code: 403, payload: { success: false, message: 'Chat is blocked' } };
          return;
        }

        const receiver = db.users.find(u => u._id === receiverId);
        if (!receiver) {
          created = { code: 404, payload: { success: false, message: 'User not found' } };
          return;
        }

        if (hasAccepted(db, req.user._id, receiverId)) {
          created = { code: 200, payload: { success: true, message: 'Already connected' } };
          return;
        }

        const existingPending = db.chatRequests.find(r =>
          r.sender === req.user._id &&
          r.receiver === receiverId &&
          r.status === 'pending'
        );
        if (existingPending) {
          created = { code: 200, payload: { success: true, message: 'Request already pending' } };
          return;
        }

        const reqRecord = makeRecord({
          sender: req.user._id,
          receiver: receiverId,
          message,
          status: 'pending'
        });
        db.chatRequests.push(reqRecord);
        created = { code: 201, payload: { success: true, data: reqRecord } };
      });

      res.status(created.code).json(created.payload);
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create request' });
    }
  }

  async accept(req, res) {
    try {
      let updated = null;
      await withDb(async (db) => {
        const r = db.chatRequests.find(x => x._id === req.params.id && x.receiver === req.user._id);
        if (!r) return;
        if (r.status !== 'pending') return;
        r.status = 'accepted';
        Object.assign(r, touchRecord(r));
        updated = r;
      });
      if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });
      res.json({ success: true, data: updated });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to accept request' });
    }
  }

  async reject(req, res) {
    try {
      let updated = null;
      await withDb(async (db) => {
        const r = db.chatRequests.find(x => x._id === req.params.id && x.receiver === req.user._id);
        if (!r) return;
        if (r.status !== 'pending') return;
        r.status = 'rejected';
        Object.assign(r, touchRecord(r));
        updated = r;
      });
      if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });
      res.json({ success: true, data: updated });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to reject request' });
    }
  }
}

module.exports = new ChatRequestController();

