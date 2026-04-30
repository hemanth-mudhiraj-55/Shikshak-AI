const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const teacherController = require('../controllers/teacherController');
const teacherSessionController = require('../controllers/teacherSessionController');
const { uploadTeacherAssets, uploadTeacherSessionPdf, uploadGeneratedAvatar } = require('../middleware/uploadMiddleware');

router.get('/', authMiddleware, teacherController.getAll);
router.get('/stats', authMiddleware, teacherController.getStats);
router.get('/admin-overview', authMiddleware, requireRole(['admin']), teacherController.getAdminOverview);
router.post('/', authMiddleware, teacherController.create);
router.post('/requests', authMiddleware, uploadTeacherAssets, teacherController.requestTeacherModel);

// Admin-only review actions for student requests
router.get('/requests', authMiddleware, requireRole(['admin']), teacherController.listRequests);
router.post('/requests/:id/approve', authMiddleware, requireRole(['admin']), teacherController.approveRequest);
router.post('/requests/:id/reject', authMiddleware, requireRole(['admin']), teacherController.rejectRequest);
router.post('/:id/prepare-avatar', authMiddleware, requireRole(['admin']), teacherController.prepareAvatar);
router.post('/:id/generated-avatar', authMiddleware, requireRole(['admin']), uploadGeneratedAvatar, teacherController.uploadGeneratedAvatar);

router.post('/:id/live-session', authMiddleware, uploadTeacherSessionPdf, teacherSessionController.createLiveSession);
router.get('/:id/live-sessions', authMiddleware, teacherSessionController.listSessionsForTeacher);
router.post('/sessions/:sessionId/ask', authMiddleware, teacherSessionController.askQuestion);
router.post('/sessions/:sessionId/interrupt', authMiddleware, teacherSessionController.interruptSession);
router.post('/sessions/:sessionId/feedback', authMiddleware, teacherSessionController.submitFeedback);
router.get('/sessions/:sessionId', authMiddleware, teacherSessionController.getSession);

router.put('/:id', authMiddleware, teacherController.update);
router.delete('/:id', authMiddleware, teacherController.delete);

module.exports = router;
