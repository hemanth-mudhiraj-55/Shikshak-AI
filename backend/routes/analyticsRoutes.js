const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { readDb } = require('../lib/localStore');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function dateKey(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function rangeBounds(range) {
  const now = new Date();
  switch (range) {
    case 'day': {
      const start = startOfToday();
      return { start, end: now, bucket: 'day' };
    }
    case 'week': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end: now, bucket: 'day' };
    }
    case 'month': {
      const start = new Date(now);
      start.setDate(start.getDate() - 27);
      start.setHours(0, 0, 0, 0);
      return { start, end: now, bucket: 'day' };
    }
    case 'quarter': {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      start.setHours(0, 0, 0, 0);
      return { start, end: now, bucket: 'week' };
    }
    case 'year': {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 11);
      start.setHours(0, 0, 0, 0);
      return { start, end: now, bucket: 'month' };
    }
    default:
      return rangeBounds('week');
  }
}

function bucketLabel(range, index, start) {
  if (range === 'week') {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || '';
  }
  if (range === 'year') {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index] || '';
  }
  if (range === 'quarter') return `W${index + 1}`;
  if (range === 'month') return `${index + 1}`;
  if (range === 'day') return `${index + 1}`;
  return '';
}

function initSeries(length) {
  return Array.from({ length }, () => 0);
}

function addToSeries(series, index) {
  if (index < 0 || index >= series.length) return;
  series[index] += 1;
}

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const db = await readDb();
    const userId = req.user._id;
    const range = String(req.query.range || 'week');
    const subject = String(req.query.subject || 'All Subjects');
    const { start, end, bucket } = rangeBounds(range);

    const user = db.users.find(u => u._id === userId) || req.user;
    const myTeachers = db.teachers.filter(t => t.addedBy === userId);
    const myBooksThisMonth = db.userBooks.filter(ub => ub.user === userId && ub.month === new Date().toISOString().slice(0, 7));
    const myTodos = db.todos.filter(t => t.user === userId);
    const myEvents = db.events.filter(e => e.user === userId);
    const myHomework = db.homework.filter(h => h.user === userId);
    const myExams = db.exams.filter(ex => ex.user === userId);
    const myMessages = db.messages.filter(m => m.sender === userId || m.receiver === userId);

    const upcomingEvents = myEvents
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    const unreadMessages = myMessages.filter(m => m.receiver === userId && !m.isRead).length;
    const pendingTasks = myTodos.filter(t => !t.completed).length;
    const completedTasks = myTodos.filter(t => t.completed).length;

    const recentActivity = [];
    myTodos
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .forEach(t => recentActivity.push({
        id: t._id,
        type: 'assignment',
        user: user.username || 'You',
        action: t.completed ? 'completed a task' : 'added a task',
        subject: subject === 'All Subjects' ? 'General' : subject,
        time: new Date(t.createdAt).toISOString()
      }));

    myMessages
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .forEach(m => recentActivity.push({
        id: m._id,
        type: 'message',
        user: user.username || 'You',
        action: m.sender === userId ? 'sent a message' : 'received a message',
        subject: subject === 'All Subjects' ? 'Messages' : subject,
        time: new Date(m.createdAt).toISOString()
      }));

    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Simple activity series: count events created/read/actions in the range.
    // This is not “study time” yet, but it gives a real trend line from existing data.
    let series = [];
    let labels = [];

    if (bucket === 'day') {
      const dayCount = Math.max(1, daysBetween(start, end) + 1);
      series = initSeries(dayCount);
      for (let i = 0; i < dayCount; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        labels.push(bucketLabel(range, i, start) || dateKey(d));
      }

      const touch = (d) => {
        const key = dateKey(d);
        const idx = labels.findIndex(l => l === key);
        return idx;
      };

      // Use ISO date keys for daily labels when not week.
      if (range !== 'week') {
        labels = labels.map((_, i) => dateKey(new Date(start.getTime() + i * 86400000)));
      }

      myTodos.forEach(t => {
        const created = new Date(t.createdAt);
        if (created >= start && created <= end) addToSeries(series, touch(created));
      });
      myEvents.forEach(e => {
        const created = new Date(e.createdAt || e.date);
        if (created >= start && created <= end) addToSeries(series, touch(created));
      });
      myBooksThisMonth.forEach(b => {
        const lastRead = new Date(b.lastReadAt || b.updatedAt || b.createdAt);
        if (lastRead >= start && lastRead <= end) addToSeries(series, touch(lastRead));
      });
    } else if (bucket === 'week') {
      // Quarter view: 4 weeks buckets (approx)
      series = initSeries(4);
      labels = ['W1', 'W2', 'W3', 'W4'];
    } else {
      // Year view: 12 months buckets
      series = initSeries(12);
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }

    res.json({
      success: true,
      data: {
        range,
        filters: { subject },
        overview: {
          myTeachers: myTeachers.length,
          myBooksThisMonth: myBooksThisMonth.length,
          myReadingStreak: user.readingStreak || 0,
          myTotalPagesRead: user.totalPagesRead || 0,
          pendingTasks,
          completedTasks,
          totalTodos: myTodos.length,
          unreadMessages,
          homeworkCount: myHomework.length,
          upcomingExams: myExams.filter(ex => ex.status === 'upcoming').length
        },
        upcomingEvents,
        recentActivity,
        performance: {
          labels,
          series
        }
      }
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics summary' });
  }
});

module.exports = router;
