const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');

class HomeworkController {
  async getAll(req, res) {
    try {
      const db = await readDb();
      const homeworks = db.homework
        .filter(item => item.user === req.user._id)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      res.json({ success: true, data: homeworks });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch homework' });
    }
  }

  async create(req, res) {
    try {
      const { title, subject, description, dueDate, priority } = req.body;
      if (!title || !subject || !dueDate) {
        return res.status(400).json({ success: false, message: 'Title, subject, and due date are required' });
      }

      let homework;
      await withDb(async (db) => {
        homework = makeRecord({
          user: req.user._id,
          title,
          subject,
          description: description || '',
          dueDate,
          priority: priority || 'medium',
          completed: false
        });
        db.homework.push(homework);
      });

      res.status(201).json({ success: true, data: homework });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create homework' });
    }
  }

  async update(req, res) {
    try {
      let homework;
      await withDb(async (db) => {
        const existing = db.homework.find(item => item._id === req.params.id && item.user === req.user._id);
        if (!existing) {
          return;
        }
        homework = Object.assign(existing, touchRecord(existing, req.body));
      });
      if (!homework) return res.status(404).json({ success: false, message: 'Homework not found' });
      res.json({ success: true, data: homework });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update homework' });
    }
  }

  async delete(req, res) {
    try {
      await withDb(async (db) => {
        db.homework = db.homework.filter(item => !(item._id === req.params.id && item.user === req.user._id));
      });
      res.json({ success: true, message: 'Homework deleted' });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete homework' });
    }
  }
}

module.exports = new HomeworkController();
