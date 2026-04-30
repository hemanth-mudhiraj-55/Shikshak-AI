const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const adminExamController = require('../controllers/adminExamController');

router.use(authMiddleware);
router.use(requireRole(['admin']));

router.get('/', adminExamController.getAll);
router.post('/', adminExamController.create);
router.put('/:id', adminExamController.update);
router.delete('/:id', adminExamController.delete);

module.exports = router;
