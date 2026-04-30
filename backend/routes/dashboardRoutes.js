const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { readDb } = require('../lib/localStore');

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const db = await readDb();
    const userId = req.user._id;
    const todos = db.todos.filter(todo => todo.user === userId);
    const events = db.events
      .filter(event => event.user === userId && new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    // Student-owned counts (not global/org metrics)
    const myTeachers = db.teachers.filter(teacher => teacher.addedBy === userId).length;
    const myBooksThisMonth = db.userBooks
      .filter(entry => entry.user === userId && entry.month === new Date().toISOString().slice(0, 7))
      .length;
    const myReadingStreak = db.users.find(user => user._id === userId)?.readingStreak || 0;
    const myTotalPagesRead = db.users.find(user => user._id === userId)?.totalPagesRead || 0;

    const homeworkCount = db.homework.filter(item => item.user === userId).length;
    const upcomingExams = db.exams.filter(item => item.user === userId && item.status === 'upcoming').length;
    const unreadMessages = db.messages.filter(item => item.receiver === userId && !item.isRead).length;

    const pendingTasks = todos.filter(todo => !todo.completed).length;
    const recentTodos = todos
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        myTeachers,
        myBooksThisMonth,
        myReadingStreak,
        myTotalPagesRead,
        pendingTasks,
        totalTodos: todos.length,
        upcomingEvents: events,
        recentTodos,
        homeworkCount,
        upcomingExams,
        unreadMessages
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
