import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Star,
  Crown,
  Swords,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  UserPlus,
  UserCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Sparkles,
  Zap,
  BookOpen,
  Brain,
  Code,
  PenTool,
  Globe,
  Atom,
  Calculator,
  FlaskConical,
  Languages,
  History,
  Map,
  Music,
  Palette,
  ChevronRight
} from 'lucide-react';
import './Exam.css';

const ExamCompetition = () => {
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard', 'challenges', 'my-stats'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedSubDomain, setSelectedSubDomain] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [expandedStudent, setExpandedStudent] = useState(null);

  // Current logged in student
  const currentStudent = {
    id: 1,
    name: 'Arjun Sharma',
    rank: 3,
    points: 2450,
    avatar: 'AS',
    domain: 'Mathematics'
  };

  // Domains and Sub-domains
  const domains = [
    {
      id: 'mathematics',
      name: 'Mathematics',
      icon: <Calculator size={20} />,
      subDomains: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics']
    },
    {
      id: 'science',
      name: 'Science',
      icon: <FlaskConical size={20} />,
      subDomains: ['Physics', 'Chemistry', 'Biology', 'Environmental Science']
    },
    {
      id: 'computer-science',
      name: 'Computer Science',
      icon: <Code size={20} />,
      subDomains: ['Programming', 'Algorithms', 'Web Development', 'Database', 'AI/ML']
    },
    {
      id: 'languages',
      name: 'Languages',
      icon: <Languages size={20} />,
      subDomains: ['English', 'Hindi', 'Sanskrit', 'French', 'Spanish']
    },
    {
      id: 'social-studies',
      name: 'Social Studies',
      icon: <History size={20} />,
      subDomains: ['History', 'Geography', 'Political Science', 'Economics']
    },
    {
      id: 'arts',
      name: 'Arts',
      icon: <Palette size={20} />,
      subDomains: ['Drawing', 'Painting', 'Music', 'Dance', 'Theater']
    }
  ];

  // Students data with rankings
  const students = [
    {
      id: 1,
      name: 'Arjun Sharma',
      rank: 1,
      points: 3250,
      avatar: 'AS',
      domain: 'Mathematics',
      stats: {
        competitions: 45,
        wins: 32,
        losses: 10,
        draws: 3,
        firstPlace: 15,
        secondPlace: 10,
        thirdPlace: 7,
        winRate: 71
      },
      achievements: ['Math Wizard', 'Speed Solver', 'Champion'],
      recentActivity: [
        { type: 'win', against: 'Priya Patel', domain: 'Algebra', points: 50, date: '2h ago' },
        { type: 'win', against: 'Rahul Verma', domain: 'Geometry', points: 45, date: '1d ago' },
        { type: 'loss', against: 'Ananya Singh', domain: 'Calculus', points: -30, date: '3d ago' }
      ],
      isOnline: true,
      friendStatus: 'friend' // 'friend', 'pending', 'none'
    },
    {
      id: 2,
      name: 'Priya Patel',
      rank: 2,
      points: 2980,
      avatar: 'PP',
      domain: 'Science',
      stats: {
        competitions: 42,
        wins: 28,
        losses: 12,
        draws: 2,
        firstPlace: 12,
        secondPlace: 8,
        thirdPlace: 8,
        winRate: 67
      },
      achievements: ['Science Genius', 'Lab Expert'],
      recentActivity: [
        { type: 'win', against: 'Rahul Verma', domain: 'Physics', points: 55, date: '5h ago' },
        { type: 'loss', against: 'Arjun Sharma', domain: 'Chemistry', points: -25, date: '2d ago' }
      ],
      isOnline: true,
      friendStatus: 'none'
    },
    {
      id: 3,
      name: 'Rahul Verma',
      rank: 3,
      points: 2750,
      avatar: 'RV',
      domain: 'Computer Science',
      stats: {
        competitions: 38,
        wins: 24,
        losses: 12,
        draws: 2,
        firstPlace: 10,
        secondPlace: 8,
        thirdPlace: 6,
        winRate: 63
      },
      achievements: ['Coding Ninja', 'Algorithm Master'],
      recentActivity: [
        { type: 'win', against: 'Neha Gupta', domain: 'Programming', points: 40, date: '1d ago' },
        { type: 'loss', against: 'Priya Patel', domain: 'Algorithms', points: -20, date: '3d ago' }
      ],
      isOnline: false,
      friendStatus: 'pending' // Request sent
    },
    {
      id: 4,
      name: 'Ananya Singh',
      rank: 4,
      points: 2620,
      avatar: 'AS',
      domain: 'Languages',
      stats: {
        competitions: 35,
        wins: 22,
        losses: 11,
        draws: 2,
        firstPlace: 8,
        secondPlace: 7,
        thirdPlace: 7,
        winRate: 63
      },
      achievements: ['Grammar Guru', 'Vocabulary Star'],
      recentActivity: [
        { type: 'win', against: 'Karthik Krishnan', domain: 'English', points: 35, date: '4h ago' },
        { type: 'win', against: 'Neha Gupta', domain: 'Hindi', points: 30, date: '2d ago' }
      ],
      isOnline: true,
      friendStatus: 'none'
    },
    {
      id: 5,
      name: 'Karthik Krishnan',
      rank: 5,
      points: 2480,
      avatar: 'KK',
      domain: 'Social Studies',
      stats: {
        competitions: 32,
        wins: 19,
        losses: 11,
        draws: 2,
        firstPlace: 6,
        secondPlace: 7,
        thirdPlace: 6,
        winRate: 59
      },
      achievements: ['History Buff', 'Geography Expert'],
      recentActivity: [
        { type: 'loss', against: 'Ananya Singh', domain: 'History', points: -15, date: '1d ago' },
        { type: 'win', against: 'Rahul Verma', domain: 'Geography', points: 25, date: '4d ago' }
      ],
      isOnline: false,
      friendStatus: 'none'
    },
    {
      id: 6,
      name: 'Neha Gupta',
      rank: 6,
      points: 2350,
      avatar: 'NG',
      domain: 'Mathematics',
      stats: {
        competitions: 30,
        wins: 17,
        losses: 12,
        draws: 1,
        firstPlace: 5,
        secondPlace: 6,
        thirdPlace: 6,
        winRate: 57
      },
      achievements: ['Problem Solver'],
      recentActivity: [
        { type: 'loss', against: 'Rahul Verma', domain: 'Algebra', points: -20, date: '2d ago' },
        { type: 'loss', against: 'Ananya Singh', domain: 'Geometry', points: -15, date: '5d ago' }
      ],
      isOnline: true,
      friendStatus: 'friend'
    },
    {
      id: 7,
      name: 'Vikram Mehta',
      rank: 7,
      points: 2210,
      avatar: 'VM',
      domain: 'Science',
      stats: {
        competitions: 28,
        wins: 15,
        losses: 12,
        draws: 1,
        firstPlace: 4,
        secondPlace: 5,
        thirdPlace: 6,
        winRate: 54
      },
      achievements: [],
      recentActivity: [
        { type: 'win', against: 'Isha Desai', domain: 'Biology', points: 20, date: '1d ago' }
      ],
      isOnline: false,
      friendStatus: 'none'
    },
    {
      id: 8,
      name: 'Isha Desai',
      rank: 8,
      points: 2080,
      avatar: 'ID',
      domain: 'Computer Science',
      stats: {
        competitions: 25,
        wins: 13,
        losses: 11,
        draws: 1,
        firstPlace: 3,
        secondPlace: 4,
        thirdPlace: 6,
        winRate: 52
      },
      achievements: [],
      recentActivity: [
        { type: 'loss', against: 'Vikram Mehta', domain: 'Web Dev', points: -10, date: '2d ago' }
      ],
      isOnline: true,
      friendStatus: 'none'
    }
  ];

  // Challenge requests
  const challengeRequests = [
    {
      id: 1,
      from: 'Priya Patel',
      domain: 'Science',
      subDomain: 'Physics',
      topic: 'Laws of Motion',
      difficulty: 'Medium',
      timeLimit: '30 min',
      points: 100,
      status: 'pending',
      date: '5 min ago'
    },
    {
      id: 2,
      from: 'Rahul Verma',
      domain: 'Computer Science',
      subDomain: 'Programming',
      topic: 'Arrays & Loops',
      difficulty: 'Easy',
      timeLimit: '20 min',
      points: 50,
      status: 'pending',
      date: '1 hour ago'
    }
  ];

  // Sent challenges
  const sentChallenges = [
    {
      id: 3,
      to: 'Ananya Singh',
      domain: 'Languages',
      subDomain: 'English',
      topic: 'Grammar Rules',
      difficulty: 'Medium',
      timeLimit: '25 min',
      points: 75,
      status: 'accepted',
      date: '2 hours ago'
    },
    {
      id: 4,
      to: 'Karthik Krishnan',
      domain: 'Social Studies',
      subDomain: 'History',
      topic: 'Indian History',
      difficulty: 'Hard',
      timeLimit: '40 min',
      points: 150,
      status: 'pending',
      date: '1 day ago'
    }
  ];

  // Completed competitions
  const completedCompetitions = [
    {
      id: 1,
      opponent: 'Priya Patel',
      domain: 'Mathematics',
      subDomain: 'Algebra',
      result: 'win',
      score: '85/100',
      opponentScore: '72/100',
      points: 50,
      date: '2 days ago'
    },
    {
      id: 2,
      opponent: 'Rahul Verma',
      domain: 'Computer Science',
      subDomain: 'Algorithms',
      result: 'loss',
      score: '65/100',
      opponentScore: '82/100',
      points: -30,
      date: '5 days ago'
    },
    {
      id: 3,
      opponent: 'Ananya Singh',
      domain: 'Languages',
      subDomain: 'English',
      result: 'win',
      score: '92/100',
      opponentScore: '88/100',
      points: 45,
      date: '1 week ago'
    }
  ];

  // My statistics
  const myStats = {
    totalCompetitions: 38,
    wins: 24,
    losses: 12,
    draws: 2,
    winRate: 63,
    firstPlace: 10,
    secondPlace: 8,
    thirdPlace: 6,
    totalPoints: 2750,
    rank: 3,
    favoriteDomain: 'Computer Science',
    bestSubDomain: 'Programming',
    currentStreak: 5,
    longestStreak: 8
  };

  const getFilteredStudents = () => {
    let filtered = [...students];

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by domain
    if (selectedDomain !== 'all') {
      filtered = filtered.filter(s => 
        s.domain.toLowerCase().replace(' ', '-') === selectedDomain
      );
    }

    // Filter by subdomain (if implemented)
    if (selectedSubDomain !== 'all') {
      // This would need actual subdomain data
    }

    return filtered;
  };

  const getFriendStatusIcon = (status) => {
    switch (status) {
      case 'friend':
        return <UserCheck size={16} className="status-icon friend" />;
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      default:
        return null;
    }
  };

  const getResultBadge = (result) => {
    switch (result) {
      case 'win':
        return <span className="result-badge win"><Trophy size={12} /> Win</span>;
      case 'loss':
        return <span className="result-badge loss"><XCircle size={12} /> Loss</span>;
      case 'draw':
        return <span className="result-badge draw"><Minus size={12} /> Draw</span>;
      default:
        return null;
    }
  };

  return (
    <div className="exam-container">
      {/* Header */}
      <div className="exam-header">
        <div>
          <h1 className="exam-title">Competition Arena</h1>
          <p className="exam-subtitle">Challenge peers, prove your skills, climb the ranks</p>
        </div>
        <div className="header-actions">
          <div className="my-rank-card">
            <Crown size={20} className="rank-icon" />
            <div>
              <span className="rank-label">Your Rank</span>
              <span className="rank-value">#{currentStudent.rank}</span>
            </div>
          </div>
          <div className="my-points-card">
            <Star size={20} className="points-icon" />
            <div>
              <span className="points-label">Total Points</span>
              <span className="points-value">{currentStudent.points}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="main-stats-grid">
        <div className="main-stat-card">
          <div className="stat-icon-wrapper competitions">
            <Swords size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{myStats.totalCompetitions}</span>
            <span className="stat-label">Competitions</span>
          </div>
        </div>

        <div className="main-stat-card">
          <div className="stat-icon-wrapper wins">
            <Trophy size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{myStats.wins}</span>
            <span className="stat-label">Wins</span>
          </div>
        </div>

        <div className="main-stat-card">
          <div className="stat-icon-wrapper losses">
            <XCircle size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{myStats.losses}</span>
            <span className="stat-label">Losses</span>
          </div>
        </div>

        <div className="main-stat-card">
          <div className="stat-icon-wrapper first-place">
            <Medal size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{myStats.firstPlace}</span>
            <span className="stat-label">1st Places</span>
          </div>
        </div>

        <div className="main-stat-card">
          <div className="stat-icon-wrapper win-rate">
            <TrendingUp size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{myStats.winRate}%</span>
            <span className="stat-label">Win Rate</span>
          </div>
        </div>

        <div className="main-stat-card">
          <div className="stat-icon-wrapper streak">
            <Zap size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{myStats.currentStreak}</span>
            <span className="stat-label">Current Streak</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="exam-tabs">
        <button 
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Users size={18} />
          Leaderboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          <Swords size={18} />
          Challenges
          {challengeRequests.length > 0 && (
            <span className="tab-badge">{challengeRequests.length}</span>
          )}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'my-stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-stats')}
        >
          <BarChart3 size={18} />
          My Statistics
        </button>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="leaderboard-tab">
          {/* Filters */}
          <div className="leaderboard-filters">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search students by name or domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <select 
                className="domain-select"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                <option value="all">All Domains</option>
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>

              <select 
                className="subdomain-select"
                value={selectedSubDomain}
                onChange={(e) => setSelectedSubDomain(e.target.value)}
                disabled={selectedDomain === 'all'}
              >
                <option value="all">All Sub-domains</option>
                {selectedDomain !== 'all' && domains
                  .find(d => d.id === selectedDomain)
                  ?.subDomains.map(sub => (
                    <option key={sub} value={sub.toLowerCase()}>{sub}</option>
                  ))
                }
              </select>

              <button className="filter-btn">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Students List */}
          <div className="students-list">
            {getFilteredStudents().map((student, index) => (
              <div key={student.id} className="student-card">
                <div className="student-rank">
                  <span className="rank-number">#{student.rank}</span>
                  {student.rank === 1 && <Crown size={16} className="crown-icon" />}
                </div>

                <div className="student-avatar">
                  {student.avatar}
                  {student.isOnline && <span className="online-indicator"></span>}
                </div>

                <div className="student-info">
                  <div className="student-name-row">
                    <h3 className="student-name">{student.name}</h3>
                    {getFriendStatusIcon(student.friendStatus)}
                  </div>
                  <div className="student-domain">
                    {domains.find(d => d.name === student.domain)?.icon}
                    <span>{student.domain}</span>
                  </div>
                  <div className="student-stats-mini">
                    <span><Trophy size={12} /> {student.stats.wins} wins</span>
                    <span><Target size={12} /> {student.stats.winRate}% win rate</span>
                  </div>
                </div>

                <div className="student-points">
                  <Star size={14} />
                  <span>{student.points}</span>
                </div>

                <div className="student-actions">
                  {student.id !== currentStudent.id && (
                    <>
                      <button 
                        className="challenge-btn"
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowRequestModal(true);
                        }}
                      >
                        <Swords size={16} />
                        Challenge
                      </button>
                      <button className="message-btn">
                        <MessageSquare size={16} />
                      </button>
                    </>
                  )}
                  <button 
                    className="expand-btn"
                    onClick={() => setExpandedStudent(
                      expandedStudent === student.id ? null : student.id
                    )}
                  >
                    {expandedStudent === student.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedStudent === student.id && (
                  <div className="student-expanded">
                    <div className="expanded-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Competitions</span>
                        <span className="stat-value">{student.stats.competitions}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Wins/Losses</span>
                        <span className="stat-value">{student.stats.wins}/{student.stats.losses}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">1st/2nd/3rd</span>
                        <span className="stat-value">
                          {student.stats.firstPlace}/{student.stats.secondPlace}/{student.stats.thirdPlace}
                        </span>
                      </div>
                    </div>

                    {student.achievements.length > 0 && (
                      <div className="achievements">
                        <h4>Achievements</h4>
                        <div className="achievement-tags">
                          {student.achievements.map((ach, i) => (
                            <span key={i} className="achievement-tag">
                              <Award size={12} />
                              {ach}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="recent-activity">
                      <h4>Recent Activity</h4>
                      {student.recentActivity.map((activity, i) => (
                        <div key={i} className="activity-item">
                          {getResultBadge(activity.type)}
                          <span className="activity-text">
                            vs {activity.against} • {activity.domain}
                          </span>
                          <span className={`activity-points ${activity.type}`}>
                            {activity.type === 'win' ? '+' : ''}{activity.points}
                          </span>
                          <span className="activity-date">{activity.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="challenges-tab">
          {/* Challenge Requests */}
          <div className="challenges-section">
            <h2>Incoming Challenges</h2>
            {challengeRequests.length > 0 ? (
              <div className="challenge-cards">
                {challengeRequests.map(request => (
                  <div key={request.id} className="challenge-card incoming">
                    <div className="challenge-header">
                      <div className="challenger-info">
                        <div className="challenger-avatar">{request.from[0]}</div>
                        <div>
                          <h3>{request.from}</h3>
                          <span className="challenge-time">{request.date}</span>
                        </div>
                      </div>
                      <span className="challenge-status pending">Pending</span>
                    </div>

                    <div className="challenge-details">
                      <div className="detail-item">
                        <span className="detail-label">Domain</span>
                        <span className="detail-value">{request.domain}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Topic</span>
                        <span className="detail-value">{request.topic}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Difficulty</span>
                        <span className={`difficulty-badge ${request.difficulty.toLowerCase()}`}>
                          {request.difficulty}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Time Limit</span>
                        <span className="detail-value">{request.timeLimit}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Points</span>
                        <span className="detail-value points">{request.points}</span>
                      </div>
                    </div>

                    <div className="challenge-actions">
                      <button className="accept-btn">
                        <CheckCircle size={16} />
                        Accept Challenge
                      </button>
                      <button className="decline-btn">
                        <XCircle size={16} />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Swords size={48} />
                <p>No incoming challenges</p>
              </div>
            )}
          </div>

          {/* Sent Challenges */}
          <div className="challenges-section">
            <h2>Sent Challenges</h2>
            <div className="challenge-cards">
              {sentChallenges.map(challenge => (
                <div key={challenge.id} className="challenge-card sent">
                  <div className="challenge-header">
                    <div className="challenger-info">
                      <div className="challenger-avatar">{challenge.to[0]}</div>
                      <div>
                        <h3>To: {challenge.to}</h3>
                        <span className="challenge-time">{challenge.date}</span>
                      </div>
                    </div>
                    <span className={`challenge-status ${challenge.status}`}>
                      {challenge.status}
                    </span>
                  </div>

                  <div className="challenge-details">
                    <div className="detail-item">
                      <span className="detail-label">Domain</span>
                      <span className="detail-value">{challenge.domain}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Topic</span>
                      <span className="detail-value">{challenge.topic}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Difficulty</span>
                      <span className={`difficulty-badge ${challenge.difficulty.toLowerCase()}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Points</span>
                      <span className="detail-value points">{challenge.points}</span>
                    </div>
                  </div>

                  {challenge.status === 'pending' && (
                    <div className="challenge-actions">
                      <button className="cancel-btn">
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Completed Competitions */}
          <div className="challenges-section">
            <h2>Recent Competitions</h2>
            <div className="completed-list">
              {completedCompetitions.map(comp => (
                <div key={comp.id} className="completed-item">
                  <div className="completed-header">
                    <div className="opponent-info">
                      <div className="opponent-avatar">{comp.opponent[0]}</div>
                      <div>
                        <h4>{comp.opponent}</h4>
                        <span className="competition-domain">{comp.domain} • {comp.subDomain}</span>
                      </div>
                    </div>
                    <span className={`result-badge ${comp.result}`}>
                      {comp.result === 'win' ? <Trophy size={12} /> : <XCircle size={12} />}
                      {comp.result === 'win' ? 'Victory' : 'Defeat'}
                    </span>
                  </div>

                  <div className="completed-scores">
                    <div className="score-item">
                      <span className="score-label">Your Score</span>
                      <span className="score-value win">{comp.score}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Opponent</span>
                      <span className="score-value">{comp.opponentScore}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Points</span>
                      <span className={`score-value ${comp.result}`}>
                        {comp.result === 'win' ? '+' : ''}{comp.points}
                      </span>
                    </div>
                  </div>

                  <span className="completed-date">{comp.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* My Statistics Tab */}
      {activeTab === 'my-stats' && (
        <div className="stats-tab">
          {/* Performance Overview */}
          <div className="stats-overview">
            <div className="overview-card">
              <h3>Performance Overview</h3>
              <div className="overview-grid">
                <div className="overview-item">
                  <span className="overview-label">Win Rate</span>
                  <div className="overview-value large">{myStats.winRate}%</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${myStats.winRate}%` }}></div>
                  </div>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Total Points</span>
                  <div className="overview-value large">{myStats.totalPoints}</div>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Global Rank</span>
                  <div className="overview-value large">#{myStats.rank}</div>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <h3>Streak Stats</h3>
              <div className="streak-stats">
                <div className="streak-item">
                  <Zap size={24} className="streak-icon current" />
                  <div>
                    <span className="streak-label">Current Streak</span>
                    <span className="streak-value">{myStats.currentStreak} days</span>
                  </div>
                </div>
                <div className="streak-item">
                  <Zap size={24} className="streak-icon best" />
                  <div>
                    <span className="streak-label">Best Streak</span>
                    <span className="streak-value">{myStats.longestStreak} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="detailed-stats">
            <div className="stats-card">
              <h3>Competition Statistics</h3>
              <div className="stats-grid">
                <div className="stat-row">
                  <span>Total Competitions</span>
                  <span className="stat-number">{myStats.totalCompetitions}</span>
                </div>
                <div className="stat-row">
                  <span>Wins</span>
                  <span className="stat-number win">{myStats.wins}</span>
                </div>
                <div className="stat-row">
                  <span>Losses</span>
                  <span className="stat-number loss">{myStats.losses}</span>
                </div>
                <div className="stat-row">
                  <span>Draws</span>
                  <span className="stat-number">{myStats.draws}</span>
                </div>
                <div className="stat-row highlight">
                  <span>Win/Loss Ratio</span>
                  <span className="stat-number">{(myStats.wins / myStats.losses).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <h3>Podium Finishes</h3>
              <div className="podium-stats">
                <div className="podium-item first">
                  <Medal size={20} />
                  <span>1st Place</span>
                  <span className="podium-count">{myStats.firstPlace}</span>
                </div>
                <div className="podium-item second">
                  <Medal size={20} />
                  <span>2nd Place</span>
                  <span className="podium-count">{myStats.secondPlace}</span>
                </div>
                <div className="podium-item third">
                  <Medal size={20} />
                  <span>3rd Place</span>
                  <span className="podium-count">{myStats.thirdPlace}</span>
                </div>
              </div>
            </div>

            <div className="stats-card">
              <h3>Domain Performance</h3>
              <div className="domain-performance">
                <div className="favorite-domain">
                  <span className="label">Favorite Domain</span>
                  <span className="value">
                    {domains.find(d => d.name === myStats.favoriteDomain)?.icon}
                    {myStats.favoriteDomain}
                  </span>
                </div>
                <div className="best-subdomain">
                  <span className="label">Best Sub-domain</span>
                  <span className="value">{myStats.bestSubDomain}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="achievements-section">
            <h3>Achievements</h3>
            <div className="achievements-grid">
              <div className="achievement-card unlocked">
                <div className="achievement-icon">
                  <Trophy size={24} />
                </div>
                <div className="achievement-info">
                  <h4>First Victory</h4>
                  <p>Win your first competition</p>
                </div>
                <CheckCircle size={20} className="unlocked-icon" />
              </div>

              <div className="achievement-card unlocked">
                <div className="achievement-icon">
                  <Zap size={24} />
                </div>
                <div className="achievement-info">
                  <h4>On Fire</h4>
                  <p>Achieve a 5-win streak</p>
                </div>
                <CheckCircle size={20} className="unlocked-icon" />
              </div>

              <div className="achievement-card unlocked">
                <div className="achievement-icon">
                  <Crown size={24} />
                </div>
                <div className="achievement-info">
                  <h4>Top 10</h4>
                  <p>Reach global top 10 ranking</p>
                </div>
                <CheckCircle size={20} className="unlocked-icon" />
              </div>

              <div className="achievement-card locked">
                <div className="achievement-icon">
                  <Medal size={24} />
                </div>
                <div className="achievement-info">
                  <h4>Champion</h4>
                  <p>Win 50 competitions</p>
                  <span className="progress">24/50</span>
                </div>
                <Clock size={20} className="locked-icon" />
              </div>

              <div className="achievement-card locked">
                <div className="achievement-icon">
                  <Brain size={24} />
                </div>
                <div className="achievement-info">
                  <h4>Master of All</h4>
                  <p>Win in 5 different domains</p>
                  <span className="progress">3/5</span>
                </div>
                <Clock size={20} className="locked-icon" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Request Modal */}
      {showRequestModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Challenge {selectedStudent.name}</h2>
              <button className="close-modal" onClick={() => setShowRequestModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="challenge-form">
                <div className="form-group">
                  <label>Domain</label>
                  <select className="form-select">
                    <option value="">Select Domain</option>
                    {domains.map(domain => (
                      <option key={domain.id} value={domain.id}>{domain.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sub-domain</label>
                  <select className="form-select" disabled>
                    <option value="">Select Sub-domain</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Topic (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g., Quadratic Equations"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select className="form-select">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Time Limit</label>
                    <select className="form-select">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Points at Stake</label>
                  <input 
                    type="number" 
                    className="form-input"
                    placeholder="50"
                    min="10"
                    max="200"
                  />
                </div>

                <div className="form-group">
                  <label>Message (Optional)</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Add a personal message..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowRequestModal(false)}>
                Cancel
              </button>
              <button className="send-challenge-btn">
                <Send size={16} />
                Send Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCompetition;