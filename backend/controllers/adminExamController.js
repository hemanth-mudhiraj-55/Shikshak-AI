const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');

class AdminExamController {
  async getAll(req, res) {
    try {
      const db = await readDb();
      const exams = db.exams
        .filter(item => item.kind === 'admin')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ success: true, data: exams });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch exams' });
    }
  }

  async create(req, res) {
    try {
      const { title, subject, date, duration, totalMarks, description, assignedTo } = req.body;
      if (!title || !subject || !date) {
        return res.status(400).json({ success: false, message: 'Title, subject, and date are required' });
      }

      if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
        return res.status(400).json({ success: false, message: 'assignedTo (array of user ids) is required' });
      }

      let exam;
      await withDb(async (db) => {
        exam = makeRecord({
          kind: 'admin',
          createdBy: req.user._id,
          assignedTo,
          title,
          subject,
          date,
          duration: duration || '',
          totalMarks: totalMarks || '',
          description: description || '',
          status: new Date(date) > new Date() ? 'upcoming' : 'completed'
        });
        db.exams.push(exam);
      });

      res.status(201).json({ success: true, data: exam });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create exam' });
    }
  }

  async update(req, res) {
    try {
      let exam;
      await withDb(async (db) => {
        const existing = db.exams.find(item => item._id === req.params.id && item.kind === 'admin');
        if (!existing) return;
        const patch = { ...req.body };
        if (patch.date) {
          patch.status = new Date(patch.date) > new Date() ? 'upcoming' : 'completed';
        }
        exam = Object.assign(existing, touchRecord(existing, patch));
      });

      if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
      res.json({ success: true, data: exam });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update exam' });
    }
  }

  async delete(req, res) {
    try {
      let removed = false;
      await withDb(async (db) => {
        const before = db.exams.length;
        db.exams = db.exams.filter(item => !(item._id === req.params.id && item.kind === 'admin'));
        removed = db.exams.length !== before;
      });
      if (!removed) return res.status(404).json({ success: false, message: 'Exam not found' });
      res.json({ success: true, message: 'Exam deleted' });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete exam' });
    }
  }
}

module.exports = new AdminExamController();

