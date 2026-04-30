const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');

class AdminHomeworkPackController {
  async list(req, res) {
    try {
      const db = await readDb();
      const packs = db.homeworkPacks
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ success: true, data: packs });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch packs' });
    }
  }

  async create(req, res) {
    try {
      const { title, subject, assignedTo, levels, enabled } = req.body;
      if (!title || !subject) {
        return res.status(400).json({ success: false, message: 'title and subject are required' });
      }
      if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
        return res.status(400).json({ success: false, message: 'assignedTo must be a non-empty array of user ids' });
      }
      if (!Array.isArray(levels) || levels.length === 0) {
        return res.status(400).json({ success: false, message: 'levels must be a non-empty array' });
      }

      let pack;
      await withDb(async (db) => {
        pack = makeRecord({
          kind: 'admin',
          createdBy: req.user._id,
          title: String(title),
          subject: String(subject),
          assignedTo,
          enabled: enabled !== false,
          levels
        });
        db.homeworkPacks.push(pack);
      });

      res.status(201).json({ success: true, data: pack });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create pack' });
    }
  }

  async update(req, res) {
    try {
      let pack;
      await withDb(async (db) => {
        const existing = db.homeworkPacks.find(p => p._id === req.params.id);
        if (!existing) return;
        pack = Object.assign(existing, touchRecord(existing, req.body));
      });
      if (!pack) return res.status(404).json({ success: false, message: 'Pack not found' });
      res.json({ success: true, data: pack });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update pack' });
    }
  }

  async remove(req, res) {
    try {
      let removed = false;
      await withDb(async (db) => {
        const before = db.homeworkPacks.length;
        db.homeworkPacks = db.homeworkPacks.filter(p => p._id !== req.params.id);
        removed = db.homeworkPacks.length !== before;
      });
      if (!removed) return res.status(404).json({ success: false, message: 'Pack not found' });
      res.json({ success: true, message: 'Pack deleted' });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete pack' });
    }
  }
}

module.exports = new AdminHomeworkPackController();

