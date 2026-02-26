import React, { useState } from 'react';
import {
  BookOpen,
  PenTool,
  MessageSquare,
  Brain,
  ChevronRight,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Bot,
  Sparkles,
  BookMarked,
  FileText,
  HelpCircle,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  GraduationCap
} from 'lucide-react';
import './HomeWork.css';

const Homework = () => {
  const [activeTab, setActiveTab] = useState('paper-work'); // 'paper-work' or 'train-bot'
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showMcqModal, setShowMcqModal] = useState(false);
  const [selectedMcq, setSelectedMcq] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [botMessage, setBotMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, type: 'bot', message: 'Hi! I\'m your learning assistant. What topic from your class would you like to practice today?' }
  ]);

  // Sample data
  const subjects = [
    { id: 'all', name: 'All Subjects', icon: <BookOpen size={16} /> },
    { id: 'math', name: 'Mathematics', icon: <Brain size={16} /> },
    { id: 'science', name: 'Science', icon: <BookMarked size={16} /> },
    { id: 'english', name: 'English', icon: <FileText size={16} /> }
  ];

  const mcqQuestions = [
    {
      id: 1,
      subject: 'Mathematics',
      topic: 'Algebra - Linear Equations',
      question: 'Solve for x: 2x + 5 = 15',
      options: ['x = 5', 'x = 10', 'x = 7', 'x = 3'],
      correct: 0,
      difficulty: 'Easy',
      points: 10
    },
    {
      id: 2,
      subject: 'Mathematics',
      topic: 'Geometry - Triangles',
      question: 'What is the sum of angles in a triangle?',
      options: ['180°', '360°', '90°', '270°'],
      correct: 0,
      difficulty: 'Easy',
      points: 10
    },
    {
      id: 3,
      subject: 'Science',
      topic: 'Physics - Motion',
      question: 'What is the SI unit of force?',
      options: ['Newton', 'Joule', 'Watt', 'Pascal'],
      correct: 0,
      difficulty: 'Medium',
      points: 15
    },
    {
      id: 4,
      subject: 'Science',
      topic: 'Chemistry - Periodic Table',
      question: 'Which element has the chemical symbol "O"?',
      options: ['Oxygen', 'Gold', 'Osmium', 'Oganesson'],
      correct: 0,
      difficulty: 'Easy',
      points: 10
    },
    {
      id: 5,
      subject: 'English',
      topic: 'Grammar - Tenses',
      question: 'Which sentence is in the past tense?',
      options: [
        'She walks to school',
        'She walked to school',
        'She will walk to school',
        'She is walking to school'
      ],
      correct: 1,
      difficulty: 'Medium',
      points: 15
    }
  ];

  const assignments = [
    {
      id: 1,
      title: 'Algebra Worksheet',
      subject: 'Mathematics',
      type: 'Worksheet',
      dueDate: '2024-03-25',
      status: 'pending',
      questions: 10,
      completed: 0
    },
    {
      id: 2,
      title: 'Chemical Reactions Quiz',
      subject: 'Science',
      type: 'Quiz',
      dueDate: '2024-03-23',
      status: 'in-progress',
      questions: 15,
      completed: 8
    },
    {
      id: 3,
      title: 'Essay Writing - My Hero',
      subject: 'English',
      type: 'Essay',
      dueDate: '2024-03-28',
      status: 'pending',
      wordCount: 500,
      completed: 0
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'mcq',
      subject: 'Mathematics',
      topic: 'Algebra',
      score: '8/10',
      date: '2 hours ago'
    },
    {
      id: 2,
      type: 'bot',
      subject: 'Science',
      topic: 'Photosynthesis',
      duration: '15 min',
      date: 'Yesterday'
    }
  ];

  const handleMcqSelect = (mcq) => {
    setSelectedMcq(mcq);
    setSelectedOption(null);
    setShowResult(false);
    setShowMcqModal(true);
  };

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption !== null) {
      setShowResult(true);
    }
  };

  const handleSendMessage = () => {
    if (botMessage.trim()) {
      // Add user message
      setChatHistory([...chatHistory, 
        { id: chatHistory.length + 1, type: 'user', message: botMessage }
      ]);
      
      // Simulate bot response
      setTimeout(() => {
        setChatHistory(prev => [...prev, {
          id: prev.length + 1,
          type: 'bot',
          message: getBotResponse(botMessage)
        }]);
      }, 1000);
      
      setBotMessage('');
    }
  };

  const getBotResponse = (message) => {
    const responses = [
      "Great question! Let me explain that concept...",
      "Based on your class, I'd recommend practicing these types of problems.",
      "I understand you're learning about this topic. Here's a helpful example...",
      "That's an important concept. Would you like to try a practice question?",
      "I can help you with that! Let's break it down step by step."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'difficulty-easy';
      case 'Medium': return 'difficulty-medium';
      case 'Hard': return 'difficulty-hard';
      default: return '';
    }
  };

  return (
    <div className="homework-container">
      {/* Header */}
      <div className="homework-header">
        <h1 className="homework-title">Homework & Practice</h1>
        <div className="header-stats">
          <div className="header-stat">
            <Award size={20} />
            <span>250 Points</span>
          </div>
          <div className="header-stat">
            <Clock size={20} />
            <span>3 Pending</span>
          </div>
        </div>
      </div>

      {/* Main Options Tabs */}
      <div className="options-tabs">
        <button 
          className={`option-tab ${activeTab === 'paper-work' ? 'active' : ''}`}
          onClick={() => setActiveTab('paper-work')}
        >
          <PenTool size={24} />
          <div className="tab-content">
            <h3>Paper Work</h3>
            <p>MCQs, Worksheets & Assignments</p>
          </div>
          <ChevronRight size={20} className="tab-arrow" />
        </button>

        <button 
          className={`option-tab ${activeTab === 'train-bot' ? 'active' : ''}`}
          onClick={() => setActiveTab('train-bot')}
        >
          <Bot size={24} />
          <div className="tab-content">
            <h3>Train Bot</h3>
            <p>Learn from class & practice with AI</p>
          </div>
          <ChevronRight size={20} className="tab-arrow" />
        </button>
      </div>

      {/* Paper Work Section */}
      {activeTab === 'paper-work' && (
        <div className="paper-work-section">
          {/* Subject Filters */}
          <div className="subject-filters">
            {subjects.map(subject => (
              <button
                key={subject.id}
                className={`subject-filter ${selectedSubject === subject.id ? 'active' : ''}`}
                onClick={() => setSelectedSubject(subject.id)}
              >
                {subject.icon}
                {subject.name}
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="paper-work-stats">
            <div className="stat-card">
              <div className="stat-icon practice">
                <PenTool size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">24</span>
                <span className="stat-label">Practice Questions</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon completed">
                <CheckCircle size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">12</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pending-work">
                <Clock size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">3</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>

          {/* MCQs Section */}
          <div className="section-header">
            <h2>Practice MCQs</h2>
            <button className="view-all">View All</button>
          </div>

          <div className="mcq-grid">
            {mcqQuestions
              .filter(q => selectedSubject === 'all' || q.subject.toLowerCase() === selectedSubject)
              .map(mcq => (
                <div key={mcq.id} className="mcq-card" onClick={() => handleMcqSelect(mcq)}>
                  <div className="mcq-header">
                    <span className="mcq-subject">{mcq.subject}</span>
                    <span className={`mcq-difficulty ${getDifficultyClass(mcq.difficulty)}`}>
                      {mcq.difficulty}
                    </span>
                  </div>
                  <h3 className="mcq-topic">{mcq.topic}</h3>
                  <p className="mcq-question-preview">{mcq.question.substring(0, 60)}...</p>
                  <div className="mcq-footer">
                    <span className="mcq-points">
                      <Award size={14} />
                      {mcq.points} points
                    </span>
                    <button className="start-practice-btn">Practice</button>
                  </div>
                </div>
              ))}
          </div>

          {/* Assignments Section */}
          <div className="section-header">
            <h2>Current Assignments</h2>
            <button className="view-all">View All</button>
          </div>

          <div className="assignments-list">
            {assignments.map(assignment => (
              <div key={assignment.id} className="assignment-card">
                <div className="assignment-icon">
                  {assignment.type === 'Worksheet' && <FileText size={24} />}
                  {assignment.type === 'Quiz' && <HelpCircle size={24} />}
                  {assignment.type === 'Essay' && <PenTool size={24} />}
                </div>
                <div className="assignment-content">
                  <div className="assignment-header">
                    <h3>{assignment.title}</h3>
                    <span className={`assignment-status ${assignment.status}`}>
                      {assignment.status}
                    </span>
                  </div>
                  <div className="assignment-details">
                    <span className="assignment-subject">{assignment.subject}</span>
                    <span className="assignment-due">
                      <Clock size={14} />
                      Due: {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  {assignment.type !== 'Essay' ? (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(assignment.completed / assignment.questions) * 100}%` }}
                      ></div>
                    </div>
                  ) : (
                    <div className="word-count">{assignment.wordCount} words</div>
                  )}
                </div>
                <button className="continue-btn">Continue</button>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    {activity.type === 'mcq' ? <CheckCircle size={16} /> : <MessageSquare size={16} />}
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">
                      {activity.type === 'mcq' ? 'Completed MCQ' : 'Practiced with Bot'} - {activity.topic}
                    </div>
                    <div className="activity-meta">
                      <span>{activity.subject}</span>
                      <span>•</span>
                      <span>{activity.type === 'mcq' ? activity.score : activity.duration}</span>
                    </div>
                  </div>
                  <span className="activity-time">{activity.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Train Bot Section */}
      {activeTab === 'train-bot' && (
        <div className="train-bot-section">
          <div className="bot-header">
            <div className="bot-info">
              <div className="bot-avatar">
                <Brain size={32} />
              </div>
              <div>
                <h2>Learning Assistant Bot</h2>
                <p>I'm learning from your class. Ask me anything!</p>
              </div>
            </div>
            <div className="bot-status">
              <span className="status-dot"></span>
              <span>Learning from: Mathematics, Science, English</span>
            </div>
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {chatHistory.map(chat => (
                <div key={chat.id} className={`message ${chat.type}`}>
                  <div className="message-avatar">
                    {chat.type === 'bot' ? <Bot size={20} /> : <GraduationCap size={20} />}
                  </div>
                  <div className="message-content">
                    <p>{chat.message}</p>
                    {chat.type === 'bot' && (
                      <div className="message-actions">
                        <button className="action-btn"><ThumbsUp size={14} /></button>
                        <button className="action-btn"><ThumbsDown size={14} /></button>
                        <button className="action-btn"><RefreshCw size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                placeholder="Ask about your class topics..."
                value={botMessage}
                onChange={(e) => setBotMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="chat-input"
              />
              <button className="send-button" onClick={handleSendMessage}>
                <Send size={20} />
              </button>
            </div>
          </div>

          {/* Suggested Topics */}
          <div className="suggested-topics">
            <h3>Suggested Topics to Practice</h3>
            <div className="topics-grid">
              <button className="topic-chip">
                <Sparkles size={16} />
                Linear Equations
              </button>
              <button className="topic-chip">
                <Sparkles size={16} />
                Photosynthesis
              </button>
              <button className="topic-chip">
                <Sparkles size={16} />
                Past Tense Verbs
              </button>
              <button className="topic-chip">
                <Sparkles size={16} />
                Pythagorean Theorem
              </button>
            </div>
          </div>

          {/* Learning Progress */}
          <div className="learning-progress">
            <h3>Topics Learned So Far</h3>
            <div className="topics-learned">
              <div className="topic-progress">
                <span>Algebra</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '80%' }}></div>
                </div>
                <span>80%</span>
              </div>
              <div className="topic-progress">
                <span>Geometry</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '60%' }}></div>
                </div>
                <span>60%</span>
              </div>
              <div className="topic-progress">
                <span>Chemical Reactions</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '45%' }}></div>
                </div>
                <span>45%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MCQ Practice Modal */}
      {showMcqModal && selectedMcq && (
        <div className="modal-overlay" onClick={() => setShowMcqModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedMcq.topic}</h2>
              <button className="close-modal" onClick={() => setShowMcqModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="question-info">
                <span className={`difficulty-badge ${getDifficultyClass(selectedMcq.difficulty)}`}>
                  {selectedMcq.difficulty}
                </span>
                <span className="points-badge">
                  <Award size={14} />
                  {selectedMcq.points} points
                </span>
              </div>

              <div className="question-text">
                <p>{selectedMcq.question}</p>
              </div>

              <div className="options-list">
                {selectedMcq.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-item ${selectedOption === index ? 'selected' : ''} 
                      ${showResult && index === selectedMcq.correct ? 'correct' : ''}
                      ${showResult && selectedOption === index && index !== selectedMcq.correct ? 'wrong' : ''}`}
                    onClick={() => !showResult && handleOptionSelect(index)}
                    disabled={showResult}
                  >
                    <span className="option-marker">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                    {showResult && index === selectedMcq.correct && (
                      <CheckCircle size={20} className="result-icon correct" />
                    )}
                    {showResult && selectedOption === index && index !== selectedMcq.correct && (
                      <XCircle size={20} className="result-icon wrong" />
                    )}
                  </button>
                ))}
              </div>

              {showResult && (
                <div className="result-feedback">
                  {selectedOption === selectedMcq.correct ? (
                    <div className="feedback correct">
                      <CheckCircle size={24} />
                      <div>
                        <h4>Correct!</h4>
                        <p>Great job! You earned {selectedMcq.points} points.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="feedback incorrect">
                      <XCircle size={24} />
                      <div>
                        <h4>Incorrect</h4>
                        <p>The correct answer is: {selectedMcq.options[selectedMcq.correct]}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {!showResult ? (
                <button 
                  className="submit-btn"
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                >
                  Submit Answer
                </button>
              ) : (
                <button 
                  className="next-btn"
                  onClick={() => {
                    setShowMcqModal(false);
                    setSelectedOption(null);
                    setShowResult(false);
                  }}
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homework;