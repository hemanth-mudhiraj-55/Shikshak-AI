const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');

function normalizeQuestions(questions = []) {
  if (!Array.isArray(questions)) return [];
  return questions
    .filter(q => q && q.prompt && Array.isArray(q.options) && q.options.length >= 2)
    .map(q => ({
      id: q.id || undefined,
      prompt: String(q.prompt),
      options: q.options.map(String),
      correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : 0,
      explanation: q.explanation ? String(q.explanation) : ''
    }))
    .map((q, idx) => ({ ...q, id: q.id || `q${idx + 1}` }));
}

class HomeworkPackController {
  async listAssigned(req, res) {
    try {
      const db = await readDb();
      const userId = req.user._id;
      const packs = db.homeworkPacks
        .filter(p => p.enabled !== false)
        .filter(p => Array.isArray(p.assignedTo) && p.assignedTo.includes(userId))
        .map(p => ({
          _id: p._id,
          title: p.title,
          subject: p.subject,
          levelCount: Array.isArray(p.levels) ? p.levels.length : 0,
          enabled: p.enabled !== false,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ success: true, data: packs });
    } catch (e) {
      console.error('List assigned packs error:', e);
      res.status(500).json({ success: false, message: 'Failed to fetch homework packs' });
    }
  }

  async getPackForAttempt(req, res) {
    try {
      const db = await readDb();
      const userId = req.user._id;
      const pack = db.homeworkPacks.find(p => p._id === req.params.id);
      if (!pack || pack.enabled === false) return res.status(404).json({ success: false, message: 'Pack not found' });
      if (!Array.isArray(pack.assignedTo) || !pack.assignedTo.includes(userId)) {
        return res.status(403).json({ success: false, message: 'Not assigned' });
      }

      const levelIndex = Number.isFinite(Number(req.query.level)) ? Math.max(0, Number(req.query.level)) : 0;
      const level = Array.isArray(pack.levels) ? pack.levels[levelIndex] : null;
      if (!level) return res.status(404).json({ success: false, message: 'Level not found' });

      const questions = normalizeQuestions(level.questions).map(q => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options
      }));

      res.json({
        success: true,
        data: {
          packId: pack._id,
          title: pack.title,
          subject: pack.subject,
          levelIndex,
          levelTitle: level.title || `Level ${levelIndex + 1}`,
          questions
        }
      });
    } catch (e) {
      console.error('Get pack error:', e);
      res.status(500).json({ success: false, message: 'Failed to fetch pack' });
    }
  }

  async submitAttempt(req, res) {
    try {
      const { answers } = req.body;
      const levelIndex = Number.isFinite(Number(req.query.level)) ? Math.max(0, Number(req.query.level)) : 0;
      if (!Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: 'answers (array) is required' });
      }

      let result;
      await withDb(async (db) => {
        const userId = req.user._id;
        const pack = db.homeworkPacks.find(p => p._id === req.params.id);
        if (!pack || pack.enabled === false) {
          result = { code: 404, payload: { success: false, message: 'Pack not found' } };
          return;
        }
        if (!Array.isArray(pack.assignedTo) || !pack.assignedTo.includes(userId)) {
          result = { code: 403, payload: { success: false, message: 'Not assigned' } };
          return;
        }

        const level = Array.isArray(pack.levels) ? pack.levels[levelIndex] : null;
        if (!level) {
          result = { code: 404, payload: { success: false, message: 'Level not found' } };
          return;
        }

        const normalized = normalizeQuestions(level.questions);
        const correct = normalized.reduce((sum, q, idx) => {
          const a = answers[idx];
          return sum + (Number(a) === q.correctIndex ? 1 : 0);
        }, 0);
        const total = normalized.length;
        const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;

        const attempt = makeRecord({
          user: userId,
          packId: pack._id,
          levelIndex,
          answers: answers.map(a => Number(a)),
          correct,
          total,
          scorePercent
        });
        db.homeworkAttempts.push(attempt);

        // Basic progress tracking on the pack assignment entry
        pack.progress ||= {};
        const prev = pack.progress[userId] || { bestScorePercent: 0, completedLevels: [] };
        const completedLevels = new Set(prev.completedLevels || []);
        if (scorePercent >= 60) completedLevels.add(levelIndex);

        pack.progress[userId] = {
          bestScorePercent: Math.max(prev.bestScorePercent || 0, scorePercent),
          completedLevels: Array.from(completedLevels)
        };
        Object.assign(pack, touchRecord(pack));

        result = {
          code: 201,
          payload: {
            success: true,
            data: {
              attemptId: attempt._id,
              correct,
              total,
              scorePercent
            }
          }
        };
      });

      res.status(result.code).json(result.payload);
    } catch (e) {
      console.error('Submit attempt error:', e);
      res.status(500).json({ success: false, message: 'Failed to submit attempt' });
    }
  }
}

module.exports = new HomeworkPackController();

