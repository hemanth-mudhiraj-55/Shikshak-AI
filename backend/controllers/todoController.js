const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');

class TodoController {
  async getAll(req, res) {
    try {
      const db = await readDb();
      const todos = db.todos
        .filter(todo => todo.user === req.user._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ success: true, data: todos });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch todos' });
    }
  }

  async create(req, res) {
    try {
      const { text, priority, dueDate } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ success: false, message: 'Task text is required' });
      }

      let todo;
      await withDb(async (db) => {
        todo = makeRecord({
          user: req.user._id,
          text: text.trim(),
          title: text.trim(),
          priority: priority || 'medium',
          dueDate: dueDate || '',
          completed: false
        });
        db.todos.push(todo);
      });

      res.status(201).json({ success: true, data: todo });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create todo' });
    }
  }

  async update(req, res) {
    try {
      let todo;
      await withDb(async (db) => {
        const existing = db.todos.find(item => item._id === req.params.id && item.user === req.user._id);
        if (!existing) {
          return;
        }
        todo = Object.assign(existing, touchRecord(existing, {
          ...req.body,
          title: req.body.text ? req.body.text.trim() : existing.title
        }));
      });

      if (!todo) {
        return res.status(404).json({ success: false, message: 'Todo not found' });
      }

      res.json({ success: true, data: todo });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update todo' });
    }
  }

  async delete(req, res) {
    try {
      let removed = false;
      await withDb(async (db) => {
        const before = db.todos.length;
        db.todos = db.todos.filter(item => !(item._id === req.params.id && item.user === req.user._id));
        removed = db.todos.length !== before;
      });
      if (!removed) {
        return res.status(404).json({ success: false, message: 'Todo not found' });
      }
      res.json({ success: true, message: 'Todo deleted' });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete todo' });
    }
  }

  async clearCompleted(req, res) {
    try {
      await withDb(async (db) => {
        db.todos = db.todos.filter(item => !(item.user === req.user._id && item.completed));
      });
      res.json({ success: true, message: 'Completed todos cleared' });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to clear completed' });
    }
  }
}

module.exports = new TodoController();
