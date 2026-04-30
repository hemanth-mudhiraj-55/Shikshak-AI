const { readDb, withDb, touchRecord } = require('../lib/localStore');

class NotificationController {
  async list(req, res) {
    try {
      const db = await readDb();
      const notifications = (db.notifications || [])
        .filter(item => item.userId === req.user._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ success: true, data: notifications });
    } catch (error) {
      console.error('List notifications error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
  }

  async markRead(req, res) {
    try {
      const id = req.params.id;
      let updated;
      await withDb(async (db) => {
        updated = (db.notifications || []).find(item => item._id === id && item.userId === req.user._id);
        if (!updated) return;
        updated.isRead = true;
        updated.readAt = new Date().toISOString();
        Object.assign(updated, touchRecord(updated));
      });
      if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' });
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
  }

  async markAllRead(req, res) {
    try {
      await withDb(async (db) => {
        (db.notifications || []).forEach((item) => {
          if (item.userId === req.user._id && !item.isRead) {
            item.isRead = true;
            item.readAt = new Date().toISOString();
            Object.assign(item, touchRecord(item));
          }
        });
      });
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
  }
}

module.exports = new NotificationController();

