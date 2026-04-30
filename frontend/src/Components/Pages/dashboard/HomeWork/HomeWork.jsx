import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  HelpCircle,
  PenTool,
  RefreshCw,
  Send,
  XCircle
} from 'lucide-react';
import './HomeWork.css';
import { api } from '../../../../services/api';

const Homework = () => {
  const [activeTab, setActiveTab] = useState('game'); // game | train-bot
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Game Homework (MCQ packs)
  const [packs, setPacks] = useState([]);
  const [openPackData, setOpenPackData] = useState(null); // { packId,title,subject,levelIndex,levelTitle,questions[] }
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [attemptAnswers, setAttemptAnswers] = useState([]);
  const [attemptResult, setAttemptResult] = useState(null);

  // Train bot
  const [quota, setQuota] = useState(null);
  const [memory, setMemory] = useState([]);
  const [trainText, setTrainText] = useState('');
  const [trainBusy, setTrainBusy] = useState(false);

  const remaining = quota?.remaining ?? 0;
  const limit = quota?.limit ?? 0;
  const used = quota?.used ?? 0;
  const charCount = trainText.length;
  const canTrain = charCount > 0 && (!quota || charCount <= remaining);

  const headerStats = useMemo(() => {
    return {
      packsCount: packs.length,
      memoryCount: memory.length
    };
  }, [packs.length, memory.length]);

  const loadPacks = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await api.get('/homework/packs');
      if (response.success) setPacks(response.data.data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load homework packs.');
    } finally {
      setLoading(false);
    }
  };

  const openPack = async (packId, levelIndex = 0) => {
    try {
      setError('');
      setAttemptResult(null);
      setAttemptAnswers([]);
      setSelectedLevel(levelIndex);

      const response = await api.get(`/homework/packs/${packId}?level=${levelIndex}`);
      if (response.success) {
        const data = response.data.data;
        setOpenPackData(data);
        setAttemptAnswers(Array.from({ length: data.questions.length }, () => -1));
      }
    } catch (e) {
      setError(e?.message || 'Failed to open pack.');
    }
  };

  const closePack = () => {
    setOpenPackData(null);
    setAttemptAnswers([]);
    setAttemptResult(null);
  };

  const submitAttempt = async () => {
    if (!openPackData) return;
    try {
      setError('');
      setLoading(true);
      const response = await api.post(`/homework/packs/${openPackData.packId}/attempt?level=${selectedLevel}`, {
        answers: attemptAnswers
      });
      if (response.success) {
        setAttemptResult(response.data.data);
      }
    } catch (e) {
      setError(e?.message || 'Failed to submit attempt.');
    } finally {
      setLoading(false);
    }
  };

  const loadQuota = async () => {
    const response = await api.get('/bot/quota');
    if (response.success) setQuota(response.data.data);
  };

  const loadMemory = async () => {
    const response = await api.get('/bot/memory');
    if (response.success) setMemory(response.data.data || []);
  };

  const refreshTrainBot = async () => {
    try {
      setError('');
      await Promise.all([loadQuota(), loadMemory()]);
    } catch (e) {
      setError(e?.message || 'Failed to refresh bot info.');
    }
  };

  const trainBot = async () => {
    if (!trainText.trim()) return;
    try {
      setError('');
      setTrainBusy(true);
      const response = await api.post('/bot/train', { text: trainText });
      if (response.success) {
        setTrainText('');
        await refreshTrainBot();
      }
    } catch (e) {
      setError(e?.message || 'Failed to train bot.');
    } finally {
      setTrainBusy(false);
    }
  };

  useEffect(() => {
    loadPacks();
    refreshTrainBot();
  }, []);

  return (
    <div className="homework-container">
      <div className="homework-header">
        <div>
          <h1 className="homework-title">Homework Hub</h1>
          <p className="homework-subtitle">Practice MCQs or train your bot with what you learned</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <BookOpen size={16} />
            <span>{headerStats.packsCount} Packs</span>
          </div>
          <div className="header-stat">
            <Brain size={16} />
            <span>{headerStats.memoryCount} Bot Notes</span>
          </div>
        </div>
      </div>

      <div className="options-tabs">
        <button
          className={`option-tab ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          <div className="option-icon paper-work">
            <PenTool size={24} />
          </div>
          <div className="option-content">
            <h3>Game Homework</h3>
            <p>MCQ packs and levels (admin assigned)</p>
          </div>
          <span className="option-arrow">›</span>
        </button>

        <button
          className={`option-tab ${activeTab === 'train-bot' ? 'active' : ''}`}
          onClick={() => setActiveTab('train-bot')}
        >
          <div className="option-icon train-bot">
            <Brain size={24} />
          </div>
          <div className="option-content">
            <h3>Train Bot</h3>
            <p>Daily-limited notes that your bot remembers</p>
          </div>
          <span className="option-arrow">›</span>
        </button>
      </div>

      {error && (
        <div className="empty-state">
          <p>{error}</p>
        </div>
      )}

      {activeTab === 'game' && (
        <div className="paper-work-content">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <HelpCircle size={20} />
                Assigned MCQ Packs
              </h2>
              <button className="refresh-btn" onClick={loadPacks} disabled={loading}>
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {loading && <div className="empty-state"><p>Loading packs...</p></div>}

            {!loading && packs.length === 0 && (
              <div className="empty-state">
                <p>No homework packs assigned yet.</p>
              </div>
            )}

            <div className="mcq-grid">
              {packs.map((p) => (
                <div key={p._id} className="mcq-card">
                  <div className="mcq-header">
                    <span className="difficulty-badge easy">{p.subject}</span>
                    <span className="points-badge">{p.levelCount} levels</span>
                  </div>
                  <h3 className="mcq-topic">{p.title}</h3>
                  <p className="mcq-question">Complete levels to unlock progress.</p>
                  <button className="start-mcq-btn" onClick={() => openPack(p._id, 0)}>
                    Open Pack
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'train-bot' && (
        <div className="train-bot-content">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <Brain size={20} />
                Train Your Bot
              </h2>
              <button className="refresh-btn" onClick={refreshTrainBot} disabled={trainBusy}>
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="assignment-card" style={{ marginBottom: 16 }}>
              <div className="assignment-header">
                <h3>Daily Training Quota</h3>
                <span className="assignment-status upcoming">
                  {quota ? `${used}/${limit} chars` : 'Loading...'}
                </span>
              </div>
              {quota && <p style={{ margin: 0, color: '#64748b' }}>Remaining today: <strong>{remaining}</strong> characters</p>}
            </div>

            <div className="chat-input-container">
              <textarea
                value={trainText}
                onChange={(e) => setTrainText(e.target.value)}
                placeholder="Write what you learned today (this becomes your bot memory)..."
                className="chat-input"
                rows={4}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ color: canTrain ? '#64748b' : '#ef4444' }}>
                  {charCount} chars {quota ? `(remaining ${remaining})` : ''}
                </span>
                <button className="send-btn" onClick={trainBot} disabled={!canTrain || trainBusy}>
                  <Send size={20} />
                </button>
              </div>
            </div>

            <div className="section-header" style={{ marginTop: 16 }}>
              <h2 className="section-title">
                <BookOpen size={20} />
                Recent Bot Notes
              </h2>
            </div>

            {memory.length === 0 ? (
              <div className="empty-state"><p>No notes trained yet.</p></div>
            ) : (
              <div className="activity-list">
                {memory.slice(0, 10).map((m) => (
                  <div key={m._id} className="activity-item">
                    <div className="activity-content">
                      <p className="activity-text">{m.text}</p>
                      <span className="activity-time">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {openPackData && (
        <div className="mcq-modal-overlay">
          <div className="mcq-modal">
            <div className="modal-header">
              <button className="back-btn" onClick={closePack}>
                <ArrowLeft size={20} />
              </button>
              <h2>{openPackData.title}</h2>
              <div className="modal-badges">
                <span className="points-badge">Level {openPackData.levelIndex + 1}</span>
              </div>
            </div>

            <div className="modal-content">
              {attemptResult ? (
                <div className="result-section">
                  <div className="result correct">
                    <Award size={48} />
                    <h3>Score: {attemptResult.scorePercent}%</h3>
                    <p>{attemptResult.correct}/{attemptResult.total} correct</p>
                    <button className="next-btn" onClick={closePack}>Done</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="question-section">
                    <p className="question-text">{openPackData.levelTitle}</p>
                  </div>

                  <div className="options-section">
                    {openPackData.questions.map((q, qIdx) => (
                      <div key={q.id} style={{ marginBottom: 12 }}>
                        <p className="question-text" style={{ marginBottom: 8 }}>{qIdx + 1}. {q.prompt}</p>
                        {q.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            className={`option-btn ${attemptAnswers[qIdx] === optIdx ? 'selected' : ''}`}
                            onClick={() => {
                              const next = [...attemptAnswers];
                              next[qIdx] = optIdx;
                              setAttemptAnswers(next);
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>

                  <button
                    className="submit-btn"
                    onClick={submitAttempt}
                    disabled={attemptAnswers.some(a => a < 0) || loading}
                  >
                    Submit Attempt
                  </button>

                  {attemptAnswers.some(a => a < 0) && (
                    <div className="empty-state">
                      <p><XCircle size={16} /> Answer all questions to submit.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homework;

