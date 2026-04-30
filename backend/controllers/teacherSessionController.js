const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');
const { pushNotification } = require('../services/notificationService');

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in',
  'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with',
  'this', 'these', 'those', 'or', 'if', 'into', 'their', 'there', 'them', 'we', 'you',
  'your', 'our', 'they', 'can', 'could', 'should', 'would', 'about', 'than', 'then'
]);

function buildUploadPath(file) {
  if (!file?.path) return null;
  const marker = `${require('path').sep}uploads${require('path').sep}`;
  const raw = String(file.path);
  const idx = raw.indexOf(marker);
  return idx >= 0 ? raw.slice(idx + 1).replace(/\\/g, '/') : raw.replace(/\\/g, '/');
}

function clampText(text, max = 12000) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean);
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function sentenceScore(sentence, freqMap) {
  return tokenize(sentence).reduce((sum, word) => sum + (freqMap.get(word) || 0), 0);
}

function buildFrequencyMap(text) {
  const map = new Map();
  tokenize(text).forEach((word) => {
    map.set(word, (map.get(word) || 0) + 1);
  });
  return map;
}

function localSummary(text) {
  const cleaned = clampText(text, 6000);
  if (!cleaned) return 'No readable text was found in this PDF.';
  const sentences = splitSentences(cleaned);
  if (sentences.length <= 5) {
    return sentences.length ? sentences.join(' ') : cleaned.slice(0, 900);
  }

  const freqMap = buildFrequencyMap(cleaned);
  const scored = sentences.map((sentence, index) => ({
    sentence,
    index,
    score: sentenceScore(sentence, freqMap)
  }));

  const picked = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence);

  return picked.length ? picked.join(' ') : cleaned.slice(0, 900);
}

function localAnswer(question, sourceText, summaryText) {
  const q = String(question || '').toLowerCase();
  const searchPool = splitSentences(`${summaryText} ${sourceText}`).slice(0, 80);
  const words = q.split(/\W+/).filter(word => word.length > 3 && !STOP_WORDS.has(word));
  const matches = searchPool.map((sentence) => ({
    sentence,
    score: words.reduce((sum, word) => sum + (sentence.toLowerCase().includes(word) ? 1 : 0), 0)
  }));

  const best = matches.sort((a, b) => b.score - a.score)[0];
  if (best?.score > 0) {
    return best.sentence;
  }

  const summarySentences = splitSentences(summaryText).slice(0, 2);
  if (summarySentences.length) {
    return summarySentences.join(' ');
  }

  return 'I could not find a confident answer in the uploaded PDF.';
}

function localBulletPoints(text) {
  const summary = localSummary(text);
  return splitSentences(summary)
    .slice(0, 4)
    .map(sentence => sentence.replace(/^[\-\*\d\.\s]+/, '').trim())
    .filter(Boolean);
}

function localKeywords(text) {
  const freqMap = buildFrequencyMap(clampText(text, 8000));
  return [...freqMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function localQuizQuestions(text, summaryText) {
  const source = splitSentences(`${summaryText} ${clampText(text, 4000)}`).slice(0, 12);
  const templates = [
    'What is the main idea explained in: "{sentence}"?',
    'How would you explain this point in your own words: "{sentence}"?',
    'Why is this statement important in the lesson: "{sentence}"?'
  ];

  return source.slice(0, 3).map((sentence, index) => {
    const template = templates[index % templates.length];
    return template.replace('{sentence}', sentence.slice(0, 140));
  });
}

function localRecap(summaryText, keyPoints) {
  const points = Array.isArray(keyPoints) ? keyPoints.slice(0, 3) : [];
  const pointText = points.length ? ` Remember these ideas: ${points.join(' | ')}.` : '';
  return `${summaryText}${pointText}`.trim();
}

function buildLocalLesson(text) {
  const summaryText = localSummary(text);
  return {
    summaryText,
    keyPoints: localBulletPoints(text),
    keywords: localKeywords(text),
    quizQuestions: localQuizQuestions(text, summaryText),
    recapText: localRecap(summaryText, localBulletPoints(text))
  };
}

function normalizeExtractedText(text) {
  const normalized = clampText(text || '', 25000);
  if (normalized) return normalized;
  return 'No readable text was found in this PDF.';
}

function buildAssistantIntro(lesson) {
  const bullets = lesson.keyPoints.length
    ? ` Key points: ${lesson.keyPoints.join(' | ')}.`
    : '';
  const keywords = lesson.keywords.length
    ? ` Keywords: ${lesson.keywords.join(', ')}.`
    : '';
  const quiz = lesson.quizQuestions.length
    ? ` Quiz focus: ${lesson.quizQuestions[0]}`
    : '';
  return `${lesson.summaryText}${bullets}${keywords}${quiz}`;
}

function createTimelineEvent(type, label, meta = null) {
  return makeRecord({
    type,
    label,
    meta
  });
}

function appendTimeline(session, type, label, meta = null) {
  const events = Array.isArray(session.timeline) ? session.timeline : [];
  events.push(createTimelineEvent(type, label, meta));
  session.timeline = events;
}

function buildFollowupAnswer(question, session) {
  const best = localAnswer(question, session.extractedText, session.summaryText);
  const lower = String(question || '').toLowerCase();

  if (lower.includes('key point') || lower.includes('important point')) {
    const points = Array.isArray(session.keyPoints) ? session.keyPoints : [];
    if (points.length) {
      return `The main points are: ${points.join(' | ')}.`;
    }
  }

  if (lower.includes('keyword') || lower.includes('topic')) {
    const keywords = Array.isArray(session.keywords) ? session.keywords : [];
    if (keywords.length) {
      return `The important keywords are: ${keywords.join(', ')}.`;
    }
  }

  if (lower.includes('quiz') || lower.includes('question me')) {
    const questions = Array.isArray(session.quizQuestions) ? session.quizQuestions : [];
    if (questions.length) {
      return `Here are some quiz questions from this lesson: ${questions.join(' | ')}`;
    }
  }

  if (lower.includes('recap') || lower.includes('summarize again')) {
    if (session.recapText) {
      return session.recapText;
    }
  }

  return best;
}

class TeacherSessionController {
  async createLiveSession(req, res) {
    try {
      const teacherId = req.params.id;
      const pdfFile = req.file;

      if (!pdfFile) {
        return res.status(400).json({ success: false, message: 'PDF file is required' });
      }

      const db0 = await readDb();
      const teacher = db0.teachers.find(t => t._id === teacherId);
      if (!teacher || teacher.status !== 'approved') {
        return res.status(404).json({ success: false, message: 'Approved teacher not found' });
      }
      if (teacher.avatarStatus !== 'ready') {
        return res.status(400).json({ success: false, message: 'Teacher avatar is not ready yet' });
      }

      const buffer = await fs.readFile(pdfFile.path);
      const parsed = await pdfParse(buffer);
      const extractedText = normalizeExtractedText(parsed.text || '');
      const lesson = buildLocalLesson(extractedText);

      let session;
      await withDb(async (db) => {
        session = makeRecord({
          teacherId,
          studentId: req.user._id,
          teacherName: teacher.aiTeacherName,
          subject: teacher.subject,
          pdfUrl: buildUploadPath(pdfFile),
          pdfName: pdfFile.originalname,
          extractedText,
          summaryText: lesson.summaryText,
          keyPoints: lesson.keyPoints,
          keywords: lesson.keywords,
          quizQuestions: lesson.quizQuestions,
          recapText: lesson.recapText,
          avatarStatus: teacher.avatarStatus,
          voiceProfile: teacher.voiceProfile || 'default-teacher',
          speechRate: teacher.speechRate || 0.96,
          speechPitch: teacher.speechPitch || 1,
          teachingStyle: teacher.teachingStyle || 'friendly',
          liveState: 'ready',
          responseMode: 'local-summary-live-session',
          usedOpenAI: false,
          interrupted: false,
          feedback: null,
          timeline: [
            createTimelineEvent('session-started', 'Live class session started', { pdfName: pdfFile.originalname }),
            createTimelineEvent('summary-generated', 'Teacher prepared the first summary', { keyPoints: lesson.keyPoints.length }),
            createTimelineEvent('quiz-ready', 'Quiz prompts are ready for this lesson', { quizCount: lesson.quizQuestions.length })
          ]
        });
        db.teacherSessions.push(session);

        teacher.sessionCount = Number(teacher.sessionCount || 0) + 1;
        Object.assign(teacher, touchRecord(teacher));

        db.teacherChatMessages.push(makeRecord({
          teacherSessionId: session._id,
          role: 'assistant',
          text: buildAssistantIntro(lesson),
          kind: 'summary'
        }));
        pushNotification(db, {
          userId: req.user._id,
          title: 'Live class started',
          message: `Your class with ${teacher.aiTeacherName} is ready.`,
          type: 'live-class',
          link: '/dashboard/teachers'
        });
      });

      res.status(201).json({
        success: true,
        message: 'Live class session created',
        data: {
          session,
          summaryText: buildAssistantIntro(lesson)
        }
      });
    } catch (error) {
      console.error('Create live session error:', error);
      res.status(500).json({ success: false, message: 'Failed to create live class session' });
    }
  }

  async askQuestion(req, res) {
    try {
      const sessionId = req.params.sessionId;
      const question = String(req.body?.question || '').trim();

      if (!question) {
        return res.status(400).json({ success: false, message: 'Question is required' });
      }

      const db0 = await readDb();
      const session = db0.teacherSessions.find(s => s._id === sessionId && s.studentId === req.user._id);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Live session not found' });
      }

      const answerText = buildFollowupAnswer(question, session);

      let updatedSession;
      let assistantMessage;
      await withDb(async (db) => {
        updatedSession = db.teacherSessions.find(s => s._id === sessionId && s.studentId === req.user._id);
        if (!updatedSession) return;

        updatedSession.interrupted = false;
        updatedSession.liveState = 'responding';
        Object.assign(updatedSession, touchRecord(updatedSession));

        db.teacherChatMessages.push(makeRecord({
          teacherSessionId: sessionId,
          role: 'user',
          text: question,
          kind: 'question'
        }));

        assistantMessage = makeRecord({
          teacherSessionId: sessionId,
          role: 'assistant',
          text: answerText,
          kind: 'answer'
        });
        db.teacherChatMessages.push(assistantMessage);
        appendTimeline(updatedSession, 'question-answered', 'Student asked a follow-up question', {
          question: question.slice(0, 140)
        });

        updatedSession.liveState = 'ready';
        Object.assign(updatedSession, touchRecord(updatedSession));
      });

      res.json({
        success: true,
        data: {
          answerText,
          session: updatedSession,
          message: assistantMessage
        }
      });
    } catch (error) {
      console.error('Ask teacher question error:', error);
      res.status(500).json({ success: false, message: 'Failed to answer question' });
    }
  }

  async interruptSession(req, res) {
    try {
      const sessionId = req.params.sessionId;
      let updated;
      await withDb(async (db) => {
        updated = db.teacherSessions.find(s => s._id === sessionId && s.studentId === req.user._id);
        if (!updated) return;
        updated.interrupted = true;
        updated.liveState = 'listening';
        appendTimeline(updated, 'interrupted', 'Student interrupted the teacher to ask something new');
        Object.assign(updated, touchRecord(updated));
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Live session not found' });
      }

      res.json({ success: true, message: 'Teacher session interrupted', data: updated });
    } catch (error) {
      console.error('Interrupt teacher session error:', error);
      res.status(500).json({ success: false, message: 'Failed to interrupt live session' });
    }
  }

  async getSession(req, res) {
    try {
      const sessionId = req.params.sessionId;
      const db = await readDb();
      const session = db.teacherSessions.find(s => s._id === sessionId && (s.studentId === req.user._id || req.user.role === 'admin'));
      if (!session) {
        return res.status(404).json({ success: false, message: 'Live session not found' });
      }

      const messages = db.teacherChatMessages
        .filter(msg => msg.teacherSessionId === sessionId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      res.json({ success: true, data: { session, messages } });
    } catch (error) {
      console.error('Get teacher session error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch live session' });
    }
  }

  async listSessionsForTeacher(req, res) {
    try {
      const teacherId = req.params.id;
      const db = await readDb();
      const sessions = db.teacherSessions
        .filter(session =>
          session.teacherId === teacherId &&
          (session.studentId === req.user._id || req.user.role === 'admin')
        )
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

      res.json({ success: true, data: sessions });
    } catch (error) {
      console.error('List teacher sessions error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch teacher sessions' });
    }
  }

  async submitFeedback(req, res) {
    try {
      const sessionId = req.params.sessionId;
      const rating = Number(req.body?.rating);
      const clarity = Number(req.body?.clarity || rating || 0);
      const usefulness = Number(req.body?.usefulness || rating || 0);
      const comment = String(req.body?.comment || '').trim().slice(0, 500);

      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      }

      let updated;
      await withDb(async (db) => {
        updated = db.teacherSessions.find(s => s._id === sessionId && s.studentId === req.user._id);
        if (!updated) return;

        updated.feedback = {
          rating,
          clarity: Math.min(5, Math.max(1, clarity || rating)),
          usefulness: Math.min(5, Math.max(1, usefulness || rating)),
          comment,
          submittedAt: new Date().toISOString()
        };
        appendTimeline(updated, 'feedback-submitted', 'Student submitted session feedback', {
          rating,
          comment: comment ? comment.slice(0, 120) : null
        });
        Object.assign(updated, touchRecord(updated));
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Live session not found' });
      }

      res.json({ success: true, message: 'Feedback submitted', data: updated });
    } catch (error) {
      console.error('Submit teacher session feedback error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
  }
}

module.exports = new TeacherSessionController();
