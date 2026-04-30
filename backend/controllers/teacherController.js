const path = require('path');
const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');
const { pushNotification } = require('../services/notificationService');

const toUploadPath = (file) => {
  if (!file?.path) return null;
  const rel = path
    .join('uploads', path.basename(path.dirname(file.path)), path.basename(file.path))
    .replace(/\\/g, '/');
  // For nested dirs like uploads/teachers/photos, the dirname basename is "photos".
  // Prefer preserving the last two path segments when possible.
  const parts = file.path.split(path.sep);
  const uploadsIndex = parts.lastIndexOf('uploads');
  if (uploadsIndex >= 0) {
    const rel2 = parts.slice(uploadsIndex).join('/'); // includes "uploads/..."
    return rel2;
  }
  return rel;
};

const defaultAvatarMeta = () => ({
  avatarStatus: 'pending',
  avatarType: 'pending',
  voiceProfile: 'default-teacher',
  speechRate: 0.96,
  speechPitch: 1,
  teachingStyle: 'friendly',
  generatedAvatarUrl: null,
  previewVideoUrl: null,
  avatarPreparedAt: null,
  liveMode: 'interactive',
  sessionCount: 0
});

const buildReadinessChecklist = (teacher = {}) => ({
  approved: teacher.status === 'approved',
  avatarPrepared: teacher.avatarStatus === 'ready',
  previewUploaded: Boolean(teacher.generatedAvatarUrl || teacher.previewVideoUrl),
  liveClassReady: teacher.status === 'approved' && teacher.avatarStatus === 'ready',
  voiceConfigured: Boolean(teacher.voiceProfile) && Number.isFinite(Number(teacher.speechRate)) && Number.isFinite(Number(teacher.speechPitch)),
  consentLogged: Boolean(teacher.consent)
});

const enrichTeacher = (teacher, ratingsByTeacher = new Map()) => {
  const ratings = ratingsByTeacher.get(teacher._id) || [];
  const averageRating = ratings.length
    ? Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1))
    : null;

  return {
    ...teacher,
    readinessChecklist: buildReadinessChecklist(teacher),
    averageRating,
    feedbackCount: ratings.length
  };
};

class TeacherController {
  async getAll(req, res) {
    try {
      const { search, status } = req.query;
      const db = await readDb();
      const isAdmin = req.user?.role === 'admin';
      const isTeacher = req.user?.role === 'teacher';
      const userId = req.user?._id;
      const ratingsByTeacher = new Map();

      (db.teacherSessions || []).forEach((session) => {
        if (Number.isFinite(Number(session.feedback?.rating))) {
          const list = ratingsByTeacher.get(session.teacherId) || [];
          list.push(Number(session.feedback.rating));
          ratingsByTeacher.set(session.teacherId, list);
        }
      });

      let teachers = [...db.teachers];

      // Students should only see approved teachers + their own requests.
      if (!isAdmin && !isTeacher) {
        teachers = teachers.filter(t => t.status === 'approved' || t.addedBy === userId);
      }

      if (search) {
        const query = search.toLowerCase();
        teachers = teachers.filter(teacher =>
          (teacher.aiTeacherName || teacher.name || '').toLowerCase().includes(query) ||
          (teacher.subject || '').toLowerCase().includes(query)
        );
      }

      if (status && status !== 'all') {
        teachers = teachers.filter(teacher => teacher.status === status);
      }

      teachers = teachers.map(teacher => enrichTeacher(teacher, ratingsByTeacher));
      teachers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ success: true, data: teachers });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
    }
  }

  async create(req, res) {
    try {
      const isAdmin = req.user?.role === 'admin';
      const isTeacher = req.user?.role === 'teacher';
      const canAutoApprove = isAdmin || isTeacher;

      let teacher;
      await withDb(async (db) => {
        teacher = makeRecord({
          ...req.body,
          status: req.body.status || (canAutoApprove ? 'approved' : 'pending'),
          addedBy: req.user._id,
          ...defaultAvatarMeta()
        });
        db.teachers.push(teacher);
        pushNotification(db, {
          userId: req.user._id,
          title: 'Teacher request submitted',
          message: `${teacher.aiTeacherName || teacher.name || 'Teacher avatar'} was submitted for admin review.`,
          type: 'teacher-request',
          link: '/dashboard/teachers'
        });
      });
      res.status(201).json({ success: true, data: teacher });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create teacher' });
    }
  }

  async requestTeacherModel(req, res) {
    try {
      const aiTeacherName = String(req.body?.aiTeacherName || '').trim();
      const subject = String(req.body?.subject || '').trim();
      const consent = String(req.body?.consent || '').trim();

      if (!aiTeacherName) return res.status(400).json({ success: false, message: 'Teacher name is required' });
      if (!subject) return res.status(400).json({ success: false, message: 'Subject is required' });
      if (consent !== 'yes') return res.status(400).json({ success: false, message: 'Consent is required' });

      const photo = req.files?.teacherPhoto?.[0];
      if (!photo) return res.status(400).json({ success: false, message: 'Teacher photo is required' });

      const video = req.files?.teacherVideo?.[0];

      let teacher;
      await withDb(async (db) => {
        teacher = makeRecord({
          aiTeacherName,
          subject,
          status: 'pending',
          addedBy: req.user._id,
          requestType: 'student_request',
          consent: true,
          photoUrl: toUploadPath(photo),
          videoUrl: video ? toUploadPath(video) : null,
          approvedBy: null,
          approvedAt: null,
          rejectedBy: null,
          rejectedAt: null,
          rejectionReason: null,
          ...defaultAvatarMeta()
        });
        db.teachers.push(teacher);
        pushNotification(db, {
          userId: req.user._id,
          title: 'Teacher request submitted',
          message: `${aiTeacherName} was submitted for admin review.`,
          type: 'teacher-request',
          link: '/dashboard/teachers'
        });
      });

      res.status(201).json({ success: true, message: 'Teacher model request submitted', data: teacher });
    } catch (error) {
      console.error('Request teacher model error:', error);
      res.status(500).json({ success: false, message: 'Failed to request teacher model' });
    }
  }

  async listRequests(req, res) {
    try {
      const { status } = req.query;
      const db = await readDb();
      const ratingsByTeacher = new Map();
      (db.teacherSessions || []).forEach((session) => {
        if (Number.isFinite(Number(session.feedback?.rating))) {
          const list = ratingsByTeacher.get(session.teacherId) || [];
          list.push(Number(session.feedback.rating));
          ratingsByTeacher.set(session.teacherId, list);
        }
      });

      let requests = db.teachers.filter(t => t.requestType === 'student_request');
      if (status && status !== 'all') requests = requests.filter(r => r.status === status);
      requests = requests.map(request => enrichTeacher(request, ratingsByTeacher));
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ success: true, data: requests });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
  }

  async approveRequest(req, res) {
    try {
      const id = req.params.id;
      let updated;
      await withDb(async (db) => {
        const teacher = db.teachers.find(t => t._id === id);
        if (!teacher) return;
        teacher.status = 'approved';
        teacher.approvedBy = req.user._id;
        teacher.approvedAt = new Date().toISOString();
        teacher.rejectedBy = null;
        teacher.rejectedAt = null;
        teacher.rejectionReason = null;
        teacher.avatarStatus = teacher.avatarStatus || 'pending';
        teacher.avatarType = teacher.avatarType || 'pending';
        teacher.voiceProfile = teacher.voiceProfile || 'default-teacher';
        teacher.liveMode = 'interactive';
        updated = Object.assign(teacher, touchRecord(teacher));
        pushNotification(db, {
          userId: teacher.addedBy,
          title: 'Teacher request approved',
          message: `${teacher.aiTeacherName} is approved. Avatar preparation can start now.`,
          type: 'teacher-approved',
          link: '/dashboard/teachers'
        });
      });
      if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });
      res.json({ success: true, data: updated });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to approve request' });
    }
  }

  async rejectRequest(req, res) {
    try {
      const id = req.params.id;
      const reason = String(req.body?.reason || '').trim();
      let updated;
      await withDb(async (db) => {
        const teacher = db.teachers.find(t => t._id === id);
        if (!teacher) return;
        teacher.status = 'rejected';
        teacher.rejectedBy = req.user._id;
        teacher.rejectedAt = new Date().toISOString();
        teacher.rejectionReason = reason || 'Rejected by admin';
        updated = Object.assign(teacher, touchRecord(teacher));
        pushNotification(db, {
          userId: teacher.addedBy,
          title: 'Teacher request rejected',
          message: `${teacher.aiTeacherName} was rejected. ${teacher.rejectionReason}`,
          type: 'teacher-rejected',
          link: '/dashboard/teachers'
        });
      });
      if (!updated) return res.status(404).json({ success: false, message: 'Request not found' });
      res.json({ success: true, data: updated });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to reject request' });
    }
  }

  async update(req, res) {
    try {
      let teacher;
      await withDb(async (db) => {
        const existing = db.teachers.find(item => item._id === req.params.id);
        if (!existing) return;
        teacher = Object.assign(existing, touchRecord(existing, req.body));
      });
      if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
      res.json({ success: true, data: teacher });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update teacher' });
    }
  }

  async prepareAvatar(req, res) {
    try {
      const id = req.params.id;
      const avatarType = String(req.body?.avatarType || 'live-photo-avatar').trim();
      const voiceProfile = String(req.body?.voiceProfile || 'default-teacher').trim();
      const teachingStyle = String(req.body?.teachingStyle || 'friendly').trim();
      const speechRate = Math.min(1.3, Math.max(0.7, Number(req.body?.speechRate || 0.96)));
      const speechPitch = Math.min(1.5, Math.max(0.7, Number(req.body?.speechPitch || 1)));
      let updated;

      await withDb(async (db) => {
        const teacher = db.teachers.find(t => t._id === id);
        if (!teacher) return;
        if (teacher.status !== 'approved') {
          throw new Error('Teacher request must be approved before avatar preparation');
        }

        teacher.avatarStatus = 'processing';
        teacher.avatarType = avatarType;
        teacher.voiceProfile = voiceProfile;
        teacher.teachingStyle = teachingStyle;
        teacher.speechRate = speechRate;
        teacher.speechPitch = speechPitch;
        Object.assign(teacher, touchRecord(teacher));

        const previewUrl = teacher.videoUrl || teacher.photoUrl || null;
        teacher.avatarStatus = 'ready';
        teacher.generatedAvatarUrl = teacher.generatedAvatarUrl || previewUrl;
        teacher.previewVideoUrl = teacher.previewVideoUrl || teacher.videoUrl || null;
        teacher.avatarPreparedAt = new Date().toISOString();
        teacher.liveMode = 'interactive';
        updated = Object.assign(teacher, touchRecord(teacher));

        db.avatarJobs.push(makeRecord({
          teacherId: teacher._id,
          type: 'prepare-avatar',
          status: 'done',
          requestedBy: req.user._id,
          avatarType,
          voiceProfile,
          teachingStyle,
          speechRate,
          speechPitch
        }));
        pushNotification(db, {
          userId: teacher.addedBy,
          title: 'Teacher avatar ready',
          message: `${teacher.aiTeacherName} is now ready for live classes.`,
          type: 'avatar-ready',
          link: '/dashboard/teachers'
        });
      });

      if (!updated) return res.status(404).json({ success: false, message: 'Teacher not found' });
      res.json({ success: true, message: 'Avatar prepared successfully', data: updated });
    } catch (error) {
      if (error.message === 'Teacher request must be approved before avatar preparation') {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error('Prepare avatar error:', error);
      res.status(500).json({ success: false, message: 'Failed to prepare avatar' });
    }
  }

  async uploadGeneratedAvatar(req, res) {
    try {
      const id = req.params.id;
      const generated = req.file;
      if (!generated) {
        return res.status(400).json({ success: false, message: 'Generated avatar video is required' });
      }

      let updated;
      await withDb(async (db) => {
        const teacher = db.teachers.find(t => t._id === id);
        if (!teacher) return;
        teacher.generatedAvatarUrl = toUploadPath(generated);
        teacher.previewVideoUrl = toUploadPath(generated);
        teacher.avatarStatus = 'ready';
        teacher.avatarPreparedAt = new Date().toISOString();
        updated = Object.assign(teacher, touchRecord(teacher));
        pushNotification(db, {
          userId: teacher.addedBy,
          title: 'Avatar preview uploaded',
          message: `A generated avatar preview for ${teacher.aiTeacherName} is available.`,
          type: 'avatar-preview',
          link: '/dashboard/teachers'
        });
      });

      if (!updated) return res.status(404).json({ success: false, message: 'Teacher not found' });
      res.json({ success: true, message: 'Generated avatar uploaded successfully', data: updated });
    } catch (error) {
      console.error('Upload generated avatar error:', error);
      res.status(500).json({ success: false, message: 'Failed to upload generated avatar' });
    }
  }

  async delete(req, res) {
    try {
      let removed = false;
      await withDb(async (db) => {
        const before = db.teachers.length;
        db.teachers = db.teachers.filter(item => item._id !== req.params.id);
        removed = db.teachers.length !== before;
      });
      if (!removed) return res.status(404).json({ success: false, message: 'Teacher not found' });
      res.json({ success: true, message: 'Teacher deleted' });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to delete teacher' });
    }
  }

  async getStats(req, res) {
    try {
      const db = await readDb();
      const total = db.teachers.length;
      const approved = db.teachers.filter(item => item.status === 'approved').length;
      const pending = db.teachers.filter(item => item.status === 'pending').length;
      res.json({ success: true, data: { total, approved, pending } });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  }

  async getAdminOverview(req, res) {
    try {
      const db = await readDb();
      const teachers = db.teachers || [];
      const invoices = db.feeInvoices || [];
      const sessions = db.teacherSessions || [];
      const users = db.users || [];
      const teachersWithVoice = teachers.filter(item => item.voiceProfile && item.voiceProfile !== 'default-teacher').length;
      const teachersReadyForLive = teachers.filter(item => item.status === 'approved' && item.avatarStatus === 'ready').length;

      res.json({
        success: true,
        data: {
          totalStudents: users.filter(user => user.role === 'user').length,
          totalTeachers: teachers.filter(item => item.status === 'approved').length,
          readyAvatars: teachers.filter(item => item.avatarStatus === 'ready').length,
          pendingTeacherRequests: teachers.filter(item => item.status === 'pending').length,
          liveSessions: sessions.length,
          invoices: invoices.length,
          teachersWithVoice,
          teachersReadyForLive,
          recentNotifications: (db.notifications || []).slice(-5).reverse()
        }
      });
    } catch (error) {
      console.error('Teacher admin overview error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch admin overview' });
    }
  }
}

module.exports = new TeacherController();
