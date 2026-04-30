import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BookOpen, CheckCircle2, Clock, History, Mic, ShieldCheck, Sparkles, Star, Upload, Volume2, XCircle } from 'lucide-react';
import './Teachers.css';
import { api } from '../../../../services/api';
import authService from '../../../../services/authService';
import { API_ENDPOINTS, SERVER_BASE_URL } from '../../../../services/apiConstants';

const toAssetUrl = (value) => {
  if (!value) return null;
  const v = String(value);
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  if (v.startsWith('uploads/')) return `${SERVER_BASE_URL}/${v}`;
  if (v.startsWith('/uploads/')) return `${SERVER_BASE_URL}${v}`;
  return v;
};

const badgeClass = (value) => {
  if (value === 'approved' || value === 'ready') return 'completed';
  if (value === 'rejected' || value === 'failed') return 'pending';
  return 'pending';
};

const Teachers = () => {
  const me = authService.getStoredUser();
  const isAdmin = me?.role === 'admin';

  const [tab, setTab] = useState('approved');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [activeTeacherId, setActiveTeacherId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [question, setQuestion] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);
  const [liveUxState, setLiveUxState] = useState('idle');
  const [lastSpokenIndex, setLastSpokenIndex] = useState(-1);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, clarity: 5, usefulness: 5, comment: '' });

  const [form, setForm] = useState({
    aiTeacherName: '',
    subject: '',
    consent: false,
    teacherPhoto: null,
    teacherVideo: null,
  });

  const [classForm, setClassForm] = useState({
    pdfFile: null,
  });

  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teachersRes, notificationsRes] = await Promise.all([
        api.get('/teachers'),
        api.get(API_ENDPOINTS.NOTIFICATIONS.BASE)
      ]);
      setTeachers(teachersRes.data?.data || []);
      setNotifications(notificationsRes.data?.data || []);

      if (isAdmin) {
        const reqRes = await api.get('/teachers/requests');
        setAdminRequests(reqRes.data?.data || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!activeTeacherId) {
        setSessionHistory([]);
        return;
      }
      try {
        const res = await api.get(API_ENDPOINTS.TEACHERS.LIVE_SESSIONS(activeTeacherId));
        setSessionHistory(res.data?.data || []);
      } catch (e) {
        console.error('Failed to load session history:', e);
      }
    };
    loadHistory();
  }, [activeTeacherId]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const approvedTeachers = useMemo(
    () => teachers.filter(t => t.status === 'approved'),
    [teachers]
  );

  const myRequests = useMemo(() => {
    const myId = me?._id || me?.id;
    return teachers.filter(t => t.addedBy === myId);
  }, [teachers, me]);

  const activeTeacher = useMemo(
    () => approvedTeachers.find(t => t._id === activeTeacherId) || null,
    [approvedTeachers, activeTeacherId]
  );

  const submitRequest = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!form.aiTeacherName.trim()) throw new Error('Teacher name is required');
      if (!form.subject.trim()) throw new Error('Subject is required');
      if (!form.teacherPhoto) throw new Error('Teacher photo is required');
      if (!form.consent) throw new Error('Consent is required');

      const fd = new FormData();
      fd.append('aiTeacherName', form.aiTeacherName.trim());
      fd.append('subject', form.subject.trim());
      fd.append('consent', 'yes');
      fd.append('teacherPhoto', form.teacherPhoto);
      if (form.teacherVideo) fd.append('teacherVideo', form.teacherVideo);

      await api.postForm('/teachers/requests', fd);
      setForm({ aiTeacherName: '', subject: '', consent: false, teacherPhoto: null, teacherVideo: null });
      setTab('mine');
      await refresh();
    } catch (e2) {
      setError(e2.message || 'Failed to submit request');
    }
  };

  const startLiveClass = async (e) => {
    e.preventDefault();
    if (!activeTeacher) return;
    setSessionLoading(true);
    setError(null);
    try {
      if (!classForm.pdfFile) throw new Error('Please upload a PDF to start the class');

      const fd = new FormData();
      fd.append('teacherPdf', classForm.pdfFile);

      const res = await api.postForm(API_ENDPOINTS.TEACHERS.LIVE_SESSION(activeTeacher._id), fd);
      setActiveSession(res.data?.data?.session || null);
      setSessionMessages([
        {
          role: 'assistant',
          text: res.data?.data?.summaryText || '',
          kind: 'summary'
        }
      ]);
      setQuestion('');
      setLiveUxState('ready');
      setLastSpokenIndex(-1);
      setFeedbackForm({ rating: 5, clarity: 5, usefulness: 5, comment: '' });
      await refresh();
      const historyRes = await api.get(API_ENDPOINTS.TEACHERS.LIVE_SESSIONS(activeTeacher._id));
      setSessionHistory(historyRes.data?.data || []);
    } catch (e2) {
      setError(e2.message || 'Failed to start live class');
    } finally {
      setSessionLoading(false);
    }
  };

  const askTeacher = async () => {
    if (!activeSession || !question.trim()) return;
    const asked = question.trim();
    setQuestion('');
    setSessionMessages(prev => [...prev, { role: 'user', text: asked, kind: 'question' }]);
    setLiveUxState('thinking');

    try {
      const res = await api.post(API_ENDPOINTS.TEACHERS.ASK(activeSession._id), { question: asked });
      const answerText = res.data?.data?.answerText || '';
      setSessionMessages(prev => [...prev, { role: 'assistant', text: answerText, kind: 'answer' }]);
      setActiveSession(res.data?.data?.session || activeSession);
    } catch (e) {
      setError(e.message || 'Failed to ask teacher');
      setLiveUxState('ready');
    }
  };

  const askPresetQuestion = async (preset) => {
    if (!activeSession) return;
    setQuestion('');
    setSessionMessages(prev => [...prev, { role: 'user', text: preset, kind: 'question' }]);
    setLiveUxState('thinking');

    try {
      const res = await api.post(API_ENDPOINTS.TEACHERS.ASK(activeSession._id), { question: preset });
      const answerText = res.data?.data?.answerText || '';
      setSessionMessages(prev => [...prev, { role: 'assistant', text: answerText, kind: 'answer' }]);
      setActiveSession(res.data?.data?.session || activeSession);
    } catch (e) {
      setError(e.message || 'Failed to ask teacher');
      setLiveUxState('ready');
    }
  };

  const interruptTeacher = async () => {
    if (!activeSession) return;
    try {
      if (canSpeak) {
        window.speechSynthesis.cancel();
      }
      const res = await api.post(API_ENDPOINTS.TEACHERS.INTERRUPT(activeSession._id), {});
      setActiveSession(res.data?.data || activeSession);
      setLiveUxState('listening');
    } catch (e) {
      setError(e.message || 'Failed to interrupt teacher');
    }
  };

  const openSession = async (sessionId) => {
    try {
      setSessionLoading(true);
      const res = await api.get(API_ENDPOINTS.TEACHERS.SESSION(sessionId));
      setActiveSession(res.data?.data?.session || null);
      setSessionMessages((res.data?.data?.messages || []).map(msg => ({
        role: msg.role,
        text: msg.text,
        kind: msg.kind
      })));
      setLiveUxState(res.data?.data?.session?.liveState || 'ready');
      setLastSpokenIndex(-1);
      if (res.data?.data?.session?.feedback) {
        setFeedbackForm({
          rating: res.data.data.session.feedback.rating || 5,
          clarity: res.data.data.session.feedback.clarity || 5,
          usefulness: res.data.data.session.feedback.usefulness || 5,
          comment: res.data.data.session.feedback.comment || ''
        });
      } else {
        setFeedbackForm({ rating: 5, clarity: 5, usefulness: 5, comment: '' });
      }
    } catch (e) {
      setError(e.message || 'Failed to open session');
    } finally {
      setSessionLoading(false);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.READ(notificationId), {});
      setNotifications(prev => prev.map(item => item._id === notificationId ? { ...item, isRead: true } : item));
    } catch (e) {
      setError(e.message || 'Failed to update notification');
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, {});
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
    } catch (e) {
      setError(e.message || 'Failed to update notifications');
    }
  };

  useEffect(() => {
    if (!canSpeak) return;
    if (!sessionMessages.length) return;

    const newestIndex = sessionMessages.length - 1;
    const newest = sessionMessages[newestIndex];
    if (!newest || newest.role !== 'assistant') return;
    if (newestIndex <= lastSpokenIndex) return;

    const utterance = new SpeechSynthesisUtterance(newest.text);
    utterance.rate = Number(activeTeacher?.speechRate || activeSession?.speechRate || 0.96);
    utterance.pitch = Number(activeTeacher?.speechPitch || activeSession?.speechPitch || 1);
    utterance.onstart = () => setLiveUxState('speaking');
    utterance.onend = () => setLiveUxState('ready');
    utterance.onerror = () => setLiveUxState('ready');

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setLastSpokenIndex(newestIndex);
  }, [sessionMessages, canSpeak, lastSpokenIndex, activeTeacher, activeSession]);

  const replayTeacher = () => {
    if (!canSpeak || !sessionMessages.length) return;
    const lastAssistant = [...sessionMessages].reverse().find(msg => msg.role === 'assistant');
    if (!lastAssistant) return;
    const utterance = new SpeechSynthesisUtterance(lastAssistant.text);
    utterance.rate = Number(activeTeacher?.speechRate || activeSession?.speechRate || 0.96);
    utterance.pitch = Number(activeTeacher?.speechPitch || activeSession?.speechPitch || 1);
    utterance.onstart = () => setLiveUxState('speaking');
    utterance.onend = () => setLiveUxState('ready');
    utterance.onerror = () => setLiveUxState('ready');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const submitFeedback = async () => {
    if (!activeSession) return;
    try {
      const res = await api.post(API_ENDPOINTS.TEACHERS.FEEDBACK(activeSession._id), feedbackForm);
      setActiveSession(res.data?.data || activeSession);
      await refresh();
    } catch (e) {
      setError(e.message || 'Failed to submit session feedback');
    }
  };

  const liveStateLabel = (() => {
    if (liveUxState === 'thinking') return 'thinking';
    if (liveUxState === 'speaking') return 'speaking';
    if (liveUxState === 'listening') return 'listening';
    if (activeSession?.liveState) return activeSession.liveState;
    return 'idle';
  })();

  return (
    <div className="teachers-container">
      <div className="teachers-header">
        <div>
          <h1 className="teachers-title">Teachers</h1>
          <p className="teachers-subtitle">Request a teacher avatar, wait for approval, then start a live PDF class with a ready avatar.</p>
        </div>
        <button className="compact-filter-button" onClick={refresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: '#fee2e2', color: '#7f1d1d' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button className="pagination-button" onClick={() => setTab('approved')} disabled={tab === 'approved'}>
          <CheckCircle2 size={16} style={{ marginRight: 6 }} /> Approved
        </button>
        <button className="pagination-button" onClick={() => setTab('mine')} disabled={tab === 'mine'}>
          <Clock size={16} style={{ marginRight: 6 }} /> My Requests
        </button>
        {isAdmin && (
          <button className="pagination-button" onClick={() => setTab('admin')} disabled={tab === 'admin'}>
            <ShieldCheck size={16} style={{ marginRight: 6 }} /> Admin Review
          </button>
        )}
      </div>

      {tab === 'mine' && (
        <div className="teachers-card" style={{ marginBottom: 16, padding: 16, borderRadius: 14, background: 'white' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Request a Teacher Avatar</h2>
          <form onSubmit={submitRequest} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <label>Teacher Name</label>
              <input value={form.aiTeacherName} onChange={(e) => setForm(prev => ({ ...prev, aiTeacherName: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <label>Subject</label>
              <input value={form.subject} onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <label>Teacher Photo (required)</label>
              <input type="file" accept="image/*" onChange={(e) => setForm(prev => ({ ...prev, teacherPhoto: e.target.files?.[0] || null }))} />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <label>Teacher Video (optional preview)</label>
              <input type="file" accept="video/*" onChange={(e) => setForm(prev => ({ ...prev, teacherVideo: e.target.files?.[0] || null }))} />
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={form.consent} onChange={(e) => setForm(prev => ({ ...prev, consent: e.target.checked }))} />
              I have rights or consent to use this teacher face as an avatar in this app.
            </label>
            <button className="submit-btn" type="submit">
              <Upload size={16} style={{ marginRight: 8 }} /> Submit Request
            </button>
          </form>

          <div style={{ marginTop: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>My Requests</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {myRequests.length === 0 && <p style={{ color: '#64748b' }}>No requests yet.</p>}
              {myRequests.map((t) => (
                <div key={t._id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, border: '1px solid #e2e8f0', borderRadius: 12 }}>
                  {toAssetUrl(t.photoUrl) && <img src={toAssetUrl(t.photoUrl)} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{t.aiTeacherName}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{t.subject}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>Avatar: {t.avatarStatus || 'pending'}</div>
                    {t.status === 'rejected' && t.rejectionReason && <div style={{ color: '#b91c1c', fontSize: 12 }}>Rejected: {t.rejectionReason}</div>}
                  </div>
                  <span className={`status-badge ${badgeClass(t.status)}`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'approved' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.82)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Bell size={18} />
                  <span>Student Notifications</span>
                </div>
                <div style={{ color: '#64748b', fontSize: 13 }}>
                  Approval updates, avatar readiness, and live-class events appear here.
                </div>
              </div>
              <button className="pagination-button" type="button" onClick={markAllNotificationsRead} disabled={!notifications.some(item => !item.isRead)}>
                Mark all read
              </button>
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              {notifications.length === 0 && <div style={{ color: '#64748b', fontSize: 13 }}>No notifications yet.</div>}
              {notifications.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: item.isRead ? '#f8fafc' : '#eff6ff',
                    border: item.isRead ? '1px solid #e2e8f0' : '1px solid #bfdbfe'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.title}</div>
                      <div style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>{item.message}</div>
                      <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                    {!item.isRead && (
                      <button className="pagination-button" type="button" onClick={() => markNotificationRead(item._id)}>
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {approvedTeachers.length === 0 ? (
              <div className="empty-state">
                <p>No approved teachers yet. Submit a request first.</p>
              </div>
            ) : (
              approvedTeachers.map((t) => (
                <div key={t._id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, border: '1px solid #e2e8f0', borderRadius: 12, background: 'white' }}>
                  {toAssetUrl(t.photoUrl) && <img src={toAssetUrl(t.photoUrl)} alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>{t.aiTeacherName}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{t.subject}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>Avatar status: {t.avatarStatus || 'pending'}</div>
                  </div>
                  <span className={`status-badge ${badgeClass(t.avatarStatus)}`}>{t.avatarStatus || 'pending'}</span>
                  <button
                    className="pagination-button"
                    disabled={t.avatarStatus !== 'ready'}
                    onClick={() => {
                      setActiveTeacherId(t._id);
                      setActiveSession(null);
                      setSessionMessages([]);
                      setLiveUxState('idle');
                      setLastSpokenIndex(-1);
                    }}
                  >
                    <BookOpen size={16} style={{ marginRight: 6 }} /> Start Class
                  </button>
                </div>
              ))
            )}
          </div>

          {activeTeacher && (
            <div style={{ padding: 16, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.82)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>Live Class with {activeTeacher.aiTeacherName}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>
                    Upload a PDF once, get the summary quickly, then ask questions in the same session.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`status-badge ${badgeClass(activeTeacher.avatarStatus)}`}>{activeTeacher.avatarStatus}</span>
                  <span className={`status-badge ${badgeClass(liveStateLabel === 'ready' ? 'ready' : 'pending')}`}>{liveStateLabel}</span>
                </div>
              </div>

              <form onSubmit={startLiveClass} style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label>PDF for this class</label>
                  <input type="file" accept="application/pdf,.pdf" onChange={(e) => setClassForm(prev => ({ ...prev, pdfFile: e.target.files?.[0] || null }))} />
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  This live class currently uses a local summarizer and local PDF-based question answering. No OpenAI API key is required.
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Recommended flow: upload PDF, listen to the teacher summary, then ask follow-up questions or request quiz questions.
                </div>
                <div>
                  <button className="submit-btn" type="submit" disabled={sessionLoading}>
                    <Upload size={16} style={{ marginRight: 8 }} /> {sessionLoading ? 'Starting...' : 'Start Live Class'}
                  </button>
                </div>
              </form>

              <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 800, marginBottom: 8 }}>
                  <History size={16} />
                  <span>Previous Sessions</span>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {sessionHistory.length === 0 && <div style={{ color: '#64748b', fontSize: 13 }}>No previous live classes for this teacher yet.</div>}
                  {sessionHistory.slice(0, 5).map((session) => (
                    <div
                      key={session._id}
                      style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', flexWrap: 'wrap' }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{session.pdfName || 'PDF lesson'}</div>
                        <div style={{ color: '#64748b', fontSize: 12 }}>
                          {new Date(session.updatedAt || session.createdAt).toLocaleString()} | {session.liveState}
                        </div>
                      </div>
                      <button className="pagination-button" type="button" onClick={() => openSession(session._id)}>
                        Open Session
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {activeSession && (
                <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Session State</div>
                    <div style={{ color: '#64748b', fontSize: 13 }}>
                      Live state: {liveStateLabel} | Mode: {activeSession.responseMode}
                    </div>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
                      Voice: {activeTeacher.voiceProfile || 'default-teacher'} | Style: {activeTeacher.teachingStyle || 'friendly'} | Rate: {Number(activeTeacher.speechRate || 0.96).toFixed(2)} | Pitch: {Number(activeTeacher.speechPitch || 1).toFixed(2)}
                    </div>
                    {Array.isArray(activeSession.keyPoints) && activeSession.keyPoints.length > 0 && (
                      <div style={{ marginTop: 8, color: '#0f172a', fontSize: 13 }}>
                        <strong>Key points:</strong> {activeSession.keyPoints.join(' | ')}
                      </div>
                    )}
                    {Array.isArray(activeSession.quizQuestions) && activeSession.quizQuestions.length > 0 && (
                      <div style={{ marginTop: 8, color: '#0f172a', fontSize: 13 }}>
                        <strong>Quiz:</strong> {activeSession.quizQuestions.join(' | ')}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
                    {sessionMessages.map((msg, idx) => (
                      <div
                        key={`${msg.role}-${idx}`}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          background: msg.role === 'assistant' ? '#ecfeff' : '#f8fafc',
                          border: '1px solid #dbeafe'
                        }}
                      >
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{msg.role === 'assistant' ? 'Teacher Avatar' : 'Student'}</div>
                        <div>{msg.text}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <textarea
                      rows={4}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask the teacher a question about the uploaded PDF..."
                    />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="pagination-button" type="button" onClick={askTeacher}>
                        <Mic size={16} style={{ marginRight: 6 }} /> Ask Question
                      </button>
                      <button className="pagination-button" type="button" onClick={() => askPresetQuestion('Ask me quiz questions from this PDF.')}>
                        <Sparkles size={16} style={{ marginRight: 6 }} /> Quiz Me
                      </button>
                      <button className="pagination-button" type="button" onClick={replayTeacher} disabled={!canSpeak}>
                        <Volume2 size={16} style={{ marginRight: 6 }} /> Replay Voice
                      </button>
                      <button className="pagination-button" type="button" onClick={interruptTeacher}>
                        <XCircle size={16} style={{ marginRight: 6 }} /> Interrupt
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 800, marginBottom: 8 }}>
                      <History size={16} />
                      <span>Class Recap Timeline</span>
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {(activeSession.timeline || []).length === 0 && (
                        <div style={{ color: '#64748b', fontSize: 13 }}>Timeline will appear as the class progresses.</div>
                      )}
                      {(activeSession.timeline || []).map((event) => (
                        <div key={event._id} style={{ padding: 10, borderRadius: 10, background: 'white', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 700 }}>{event.label}</div>
                          <div style={{ color: '#64748b', fontSize: 12 }}>{new Date(event.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: 12, borderRadius: 12, background: '#fff7ed', border: '1px solid #fdba74', display: 'grid', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 800 }}>
                      <Star size={16} />
                      <span>Rate This Teacher Session</span>
                    </div>
                    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                      <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                        <span>Overall rating</span>
                        <input type="number" min="1" max="5" value={feedbackForm.rating} onChange={(e) => setFeedbackForm(prev => ({ ...prev, rating: Number(e.target.value) }))} />
                      </label>
                      <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                        <span>Clarity</span>
                        <input type="number" min="1" max="5" value={feedbackForm.clarity} onChange={(e) => setFeedbackForm(prev => ({ ...prev, clarity: Number(e.target.value) }))} />
                      </label>
                      <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                        <span>Usefulness</span>
                        <input type="number" min="1" max="5" value={feedbackForm.usefulness} onChange={(e) => setFeedbackForm(prev => ({ ...prev, usefulness: Number(e.target.value) }))} />
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      value={feedbackForm.comment}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="What felt good or what should improve in this teacher session?"
                    />
                    <div>
                      <button className="pagination-button" type="button" onClick={submitFeedback}>
                        <Star size={16} style={{ marginRight: 6 }} /> Save Feedback
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'admin' && isAdmin && (
        <div style={{ display: 'grid', gap: 10 }}>
          {adminRequests.length === 0 ? (
            <p style={{ color: '#64748b' }}>No teacher requests available.</p>
          ) : (
            adminRequests.map((t) => (
              <div key={t._id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, border: '1px solid #e2e8f0', borderRadius: 12, background: 'white' }}>
                {toAssetUrl(t.photoUrl) && <img src={toAssetUrl(t.photoUrl)} alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{t.aiTeacherName}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{t.subject}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>Status: {t.status} | Avatar: {t.avatarStatus || 'pending'}</div>
                </div>
                <span className={`status-badge ${badgeClass(t.status)}`}>{t.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Teachers;
