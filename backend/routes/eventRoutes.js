const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateEvent } = require('../middleware/validationMiddleware');
const eventController = require('../controllers/eventController');

router.get('/', authMiddleware, eventController.getAll);
router.post('/', authMiddleware, validateEvent, eventController.create);
router.put('/:id', authMiddleware, validateEvent, eventController.update);
router.delete('/:id', authMiddleware, eventController.delete);

module.exports = router;
