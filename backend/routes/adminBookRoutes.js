const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { uploadBookFiles } = require('../middleware/uploadMiddleware');
const {
  addBook,
  updateBook,
  deleteBook,
  getAllBooks,
  getAdminStats
} = require('../controllers/adminBookController');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole(['admin']));

// Stats
router.get('/stats', getAdminStats);

// Book management
router.get('/', getAllBooks);
router.post('/', uploadBookFiles, addBook);
router.put('/:id', uploadBookFiles, updateBook);
router.delete('/:id', deleteBook);

module.exports = router;