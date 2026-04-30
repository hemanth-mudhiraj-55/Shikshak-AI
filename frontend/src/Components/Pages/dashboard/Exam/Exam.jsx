import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../../../services/api';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Trophy
} from 'lucide-react';
import './Exam.css';

const Exam = () => {
  const [activeTab, setActiveTab] = useState('schedule'); // schedule | mocks | bot-league
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exams, setExams] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subject: '',
    date: '',
    time: '',
    duration: '',
    totalMarks: '',
    description: ''
  });

  const fetchExams = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await api.get('/exams');
      if (response.success) {
        setExams(response.data.data || []);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load exams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const upcoming = useMemo(
    () => exams.filter(e => e.status === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date)),
    [exams]
  );
  const completed = useMemo(
    () => exams.filter(e => e.status !== 'upcoming').sort((a, b) => new Date(b.date) - new Date(a.date)),
    [exams]
  );

  const submitPersonalExam = async () => {
    if (!form.title || !form.subject || !form.date) {
      setError('Title, subject, and date are required.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      const payload = {
        title: form.title,
        subject: form.subject,
        date: form.time ? `${form.date}T${form.time}:00` : form.date,
        duration: form.duration,
        totalMarks: form.totalMarks,
        description: form.description
      };
      const response = await api.post('/exams', payload);
      if (response.success) {
        setShowAdd(false);
        setForm({ title: '', subject: '', date: '', time: '', duration: '', totalMarks: '', description: '' });
        await fetchExams();
      }
    } catch (e) {
      setError(e?.message || 'Failed to add exam.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-container">
      <div className="exam-header">
        <div>
          <h1 className="exam-title">Exams</h1>
          <p className="exam-subtitle">Your exam schedule and preparation</p>
        </div>
        <div className="exam-actions">
          <button className="tab-btn" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Personal Exam
          </button>
          <button className="tab-btn" onClick={fetchExams} disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          <Calendar size={16} /> Schedule
        </button>
        <button className={`tab-btn ${activeTab === 'mocks' ? 'active' : ''}`} onClick={() => setActiveTab('mocks')}>
          <Clock size={16} /> Mock Tests
        </button>
        <button className={`tab-btn ${activeTab === 'bot-league' ? 'active' : ''}`} onClick={() => setActiveTab('bot-league')}>
          <Trophy size={16} /> Bot League
        </button>
      </div>

      {error && (
        <div className="empty-state">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      )}

      {!loading && activeTab === 'schedule' && (
        <div className="exam-content">
          <div className="exam-section">
            <h2 className="section-title">Upcoming</h2>
            {upcoming.length === 0 ? (
              <div className="empty-state"><p>No upcoming exams</p></div>
            ) : (
              <div className="exam-list">
                {upcoming.map((e) => (
                  <div key={e._id} className="exam-card">
                    <div className="exam-card-top">
                      <div className="exam-card-title">{e.title}</div>
                      <span className="badge">{e.kind === 'admin' ? 'Assigned' : 'Personal'}</span>
                    </div>
                    <div className="exam-card-meta">
                      <span>{e.subject}</span>
                      <span>{new Date(e.date).toLocaleString()}</span>
                      <span>{e.duration ? `${e.duration} min` : '-'}</span>
                    </div>
                    {e.description ? <div className="exam-card-desc">{e.description}</div> : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="exam-section">
            <h2 className="section-title">Completed</h2>
            {completed.length === 0 ? (
              <div className="empty-state"><p>No completed exams</p></div>
            ) : (
              <div className="exam-list">
                {completed.map((e) => (
                  <div key={e._id} className="exam-card">
                    <div className="exam-card-top">
                      <div className="exam-card-title">{e.title}</div>
                      <span className="badge">{e.kind === 'admin' ? 'Assigned' : 'Personal'}</span>
                    </div>
                    <div className="exam-card-meta">
                      <span>{e.subject}</span>
                      <span>{new Date(e.date).toLocaleString()}</span>
                      <span>{e.totalMarks ? `${e.totalMarks} marks` : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && activeTab === 'mocks' && (
        <div className="empty-state">
          <p>Mock tests are coming soon (timed attempts + scoring + review).</p>
        </div>
      )}

      {!loading && activeTab === 'bot-league' && (
        <div className="empty-state">
          <p>Bot League is coming soon (bot vs bot final exam + leaderboard).</p>
        </div>
      )}

      {showAdd && (
        <div className="reader-modal">
          <div className="reader-container">
            <div className="reader-header">
              <div className="reader-title">
                <h3>Add Personal Exam</h3>
                <p>This is only for your own schedule.</p>
              </div>
              <div className="reader-controls">
                <button className="close-btn" onClick={() => setShowAdd(false)}>×</button>
              </div>
            </div>

            <div className="reader-content">
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time (optional)</label>
                    <input type="time" className="form-input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Duration (min)</label>
                    <input className="form-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Marks</label>
                    <input className="form-input" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <button className="save-button" onClick={submitPersonalExam} disabled={loading}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;

