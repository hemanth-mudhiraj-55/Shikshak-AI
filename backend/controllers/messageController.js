const { readDb, withDb, makeRecord } = require('../lib/localStore');

const pickUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  profilePicture: user.profilePicture || null,
  role: user.role
});

const isBlocked = (db, a, b) =>
  db.blocks.some(entry =>
    (entry.blocker === a && entry.blocked === b) ||
    (entry.blocker === b && entry.blocked === a)
  );

const isAccepted = (db, a, b) =>
  db.chatRequests.some(r =>
    ((r.sender === a && r.receiver === b) || (r.sender === b && r.receiver === a)) &&
    r.status === 'accepted'
  );

class MessageController {
  async getConversations(req, res) {
    try {
      const db = await readDb();
      const userId = req.user._id;
      const messages = db.messages
        .filter(msg => msg.sender === userId || msg.receiver === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const conversationMap = {};
      messages.forEach((msg) => {
        const partnerId = msg.sender === userId ? msg.receiver : msg.sender;
        if (!isAccepted(db, userId, partnerId) || isBlocked(db, userId, partnerId)) return;
        const partner = db.users.find(user => user._id === partnerId);
        if (!partner) return;

        if (!conversationMap[partnerId]) {
          conversationMap[partnerId] = {
            partner: pickUser(partner),
            lastMessage: {
              ...msg,
              sender: pickUser(db.users.find(user => user._id === msg.sender) || partner),
              receiver: pickUser(db.users.find(user => user._id === msg.receiver) || partner)
            },
            unreadCount: 0
          };
        }

        if (msg.receiver === userId && !msg.isRead) {
          conversationMap[partnerId].unreadCount += 1;
        }
      });

      res.json({ success: true, data: Object.values(conversationMap) });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
    }
  }

  async getMessages(req, res) {
    try {
      const partnerId = req.params.partnerId;
      const userId = req.user._id;
      const db0 = await readDb();
      if (!isAccepted(db0, userId, partnerId) || isBlocked(db0, userId, partnerId)) {
        return res.status(403).json({ success: false, message: 'Chat not allowed' });
      }
      let responseData = [];

      await withDb(async (db) => {
        db.messages.forEach((msg) => {
          if (msg.sender === partnerId && msg.receiver === userId && !msg.isRead) {
            msg.isRead = true;
            msg.updatedAt = new Date().toISOString();
          }
        });

        responseData = db.messages
          .filter(msg =>
            (msg.sender === userId && msg.receiver === partnerId) ||
            (msg.sender === partnerId && msg.receiver === userId)
          )
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((msg) => ({
            ...msg,
            sender: pickUser(db.users.find(user => user._id === msg.sender) || { _id: msg.sender, username: 'Unknown', email: '', role: 'user' })
          }));
      });

      res.json({ success: true, data: responseData });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
  }

  async send(req, res) {
    try {
      const receiverId = String(req.body.receiverId || req.body.receiver || '').trim();
      const { text } = req.body;
      if (!receiverId) {
        return res.status(400).json({ success: false, message: 'receiverId is required' });
      }
      if (!text?.trim()) {
        return res.status(400).json({ success: false, message: 'Message text is required' });
      }

      let message;
      await withDb(async (db) => {
        if (!isAccepted(db, req.user._id, receiverId) || isBlocked(db, req.user._id, receiverId)) {
          throw new Error('Chat not allowed');
        }
        const sender = db.users.find(user => user._id === req.user._id);
        if (!sender) throw new Error('Sender not found');
        const receiver = db.users.find(user => user._id === receiverId);
        if (!receiver) throw new Error('Receiver not found');
        message = makeRecord({
          sender: req.user._id,
          receiver: receiverId,
          text: text.trim(),
          isRead: false,
          attachments: []
        });
        db.messages.push(message);
        message = { ...message, sender: pickUser(sender) };
      });

      res.status(201).json({ success: true, data: message });
    } catch {
      res.status(403).json({ success: false, message: 'Chat not allowed' });
    }
  }

  async delete(req, res) {
    try {
      await withDb(async (db) => {
        db.messages = db.messages.filter(msg => !(msg._id === req.params.id && msg.sender === req.user._id));
      });
      res.json({ success: true, message: 'Message deleted' });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
  }

  async getUsers(req, res) {
    try {
      const db = await readDb();
      const q = String(req.query.query || req.query.q || '').trim().toLowerCase();
      if (!q) {
        return res.json({ success: true, data: [] });
      }

      const users = db.users
        .filter(user => user._id !== req.user._id)
        .filter(user =>
          user._id.toLowerCase().includes(q) ||
          (user.username || '').toLowerCase().includes(q) ||
          (user.email || '').toLowerCase().includes(q)
        )
        .slice(0, 10)
        .map(pickUser);
      res.json({ success: true, data: users });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  }
}

module.exports = new MessageController();
