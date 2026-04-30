const express = require('express');
const router = express.Router();
const { authMiddleware, checkBookAccess } = require('../middleware/authMiddleware');
const {
  getBooks,
  getBookById,
  updateProgress,
  addHighlight,
  deleteHighlight,
  getUserStats
} = require('../controllers/bookController');

// All routes require authentication
router.use(authMiddleware);

// Stats route
router.get('/stats', getUserStats);

// Book routes
router.get('/', getBooks);
router.get('/:id', getBookById);
router.put('/:id/progress', updateProgress);
router.post('/:id/highlights', addHighlight);
router.delete('/highlights/:id', deleteHighlight);

module.exports = router;