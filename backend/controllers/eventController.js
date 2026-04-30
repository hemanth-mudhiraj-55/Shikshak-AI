const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');

class EventController {
  async getAll(req, res) {
    try {
      const db = await readDb();
      const events = db.events
        .filter(event => event.user === req.user._id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      res.json({ success: true, data: events });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch events' });
    }
  }

  async create(req, res) {
    try {
      const { title, date, time, type, description, location } = req.body;
      if (!title || !date) {
        return res.status(400).json({ success: false, message: 'Title and date are required' });
      }

      let event;
      await withDb(async (db) => {
        event = makeRecord({
          user: req.user._id,
          title,
          date,
          time: time || '',
          type: type || 'meeting',
          description: description || '',
          location: location || ''
        });
        db.events.push(event);
      });

      res.status(201).json({ success: true, data: event });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create event' });
    }
  }

  async update(req, res) {
    try {
      let event;
      await withDb(async (db) => {
        const existing = db.events.find(item => item._id === req.params.id && item.user === req.user._id);
        if (!existing) {
          return;
        }
        event = Object.assign(existing, touchRecord(existing, req.body));
      });
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      res.json({ success: true, data: event });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update event' });
    }
  }

  async delete(req, res) {
    try {
      let removed = false;
      await withDb(async (db) => {
        const before = db.events.length;
        db.events = db.events.filter(item => !(item._id === req.params.id && item.user === req.user._id));
        removed = db.events.length !== before;
      });
      if (!removed) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      res.json({ success: true, message: 'Event deleted' });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete event' });
    }
  }
}

module.exports = new EventController();
