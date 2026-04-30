const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');

class ExamController {
  async getAll(req, res) {
    try {
      const db = await readDb();
      const exams = db.exams
        .filter(item => {
          if (item.kind === 'admin') {
            return Array.isArray(item.assignedTo) && item.assignedTo.includes(req.user._id);
          }
          // default to personal exams for the current student
          return item.user === req.user._id;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      res.json({ success: true, data: exams });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch exams' });
    }
  }

  async create(req, res) {
    try {
      const { title, subject, date, duration, totalMarks, description } = req.body;
      if (!title || !subject || !date) {
        return res.status(400).json({ success: false, message: 'Title, subject, and date are required' });
      }

      let exam;
      await withDb(async (db) => {
        exam = makeRecord({
          user: req.user._id,
          kind: 'personal', // student-created (practice/personal schedule)
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
        const existing = db.exams.find(item =>
          item._id === req.params.id &&
          item.user === req.user._id &&
          (item.kind !== 'admin')
        );
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
      await withDb(async (db) => {
        db.exams = db.exams.filter(item => !(
          item._id === req.params.id &&
          item.user === req.user._id &&
          (item.kind !== 'admin')
        ));
      });
      res.json({ success: true, message: 'Exam deleted' });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete exam' });
    }
  }
}

module.exports = new ExamController();
