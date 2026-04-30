const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');

function todayKey() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function getLimit() {
  const raw = process.env.BOT_DAILY_CHAR_LIMIT;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2000;
}

class BotController {
  async quota(req, res) {
    try {
      const db = await readDb();
      const userId = req.user._id;
      const date = todayKey();
      const limit = getLimit();
      const entry = db.botQuota.find(q => q.user === userId && q.date === date);
      const used = entry?.charsUsed || 0;
      res.json({ success: true, data: { date, limit, used, remaining: Math.max(0, limit - used) } });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch quota' });
    }
  }

  async train(req, res) {
    try {
      const text = String(req.body?.text || '');
      if (!text.trim()) {
        return res.status(400).json({ success: false, message: 'text is required' });
      }

      const userId = req.user._id;
      const date = todayKey();
      const limit = getLimit();

      let result;
      await withDb(async (db) => {
        let quota = db.botQuota.find(q => q.user === userId && q.date === date);
        if (!quota) {
          quota = makeRecord({ user: userId, date, charsUsed: 0 });
          db.botQuota.push(quota);
        }

        const remaining = Math.max(0, limit - (quota.charsUsed || 0));
        if (text.length > remaining) {
          result = { code: 429, payload: { success: false, message: `Daily bot training limit reached. Remaining chars: ${remaining}` } };
          return;
        }

        const memory = makeRecord({
          user: userId,
          date,
          text,
          chars: text.length
        });
        db.botMemories.push(memory);

        quota.charsUsed = (quota.charsUsed || 0) + text.length;
        Object.assign(quota, touchRecord(quota));

        result = {
          code: 201,
          payload: {
            success: true,
            data: {
              memoryId: memory._id,
              charsAdded: text.length,
              used: quota.charsUsed,
              remaining: Math.max(0, limit - quota.charsUsed),
              limit
            }
          }
        };
      });

      res.status(result.code).json(result.payload);
    } catch (e) {
      console.error('Bot train error:', e);
      res.status(500).json({ success: false, message: 'Failed to train bot' });
    }
  }

  async memory(req, res) {
    try {
      const db = await readDb();
      const userId = req.user._id;
      const items = db.botMemories
        .filter(m => m.user === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50);
      res.json({ success: true, data: items });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch memory' });
    }
  }
}

module.exports = new BotController();

