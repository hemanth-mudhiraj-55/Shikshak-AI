import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  MoreVertical,
  Eye,
  ThumbsUp,
  MessageSquare,
  FileText,
  PieChart,
  Activity,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import './Analytics.css';

const Analytics = ({ collapsed }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for system dark mode preference
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handler = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handler);
    
    return () => darkModeMediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalStudents: 245,
      activeStudents: 189,
      totalTeachers: 18,
      totalCourses: 32,
      completionRate: 78,
      averageGrade: 85,
      totalMessages: 1243,
      totalAssignments: 567
    },
    trends: {
      studentsChange: '+12%',
      teachersChange: '+5%',
      coursesChange: '+8%',
      completionChange: '+3%',
      gradeChange: '+2%',
      messagesChange: '+15%',
      assignmentsChange: '+10%'
    },
    performance: {
      daily: [65, 72, 78, 85, 82, 88, 92],
      weekly: [450, 520, 480, 590, 610, 580, 620],
      monthly: [1850, 1920, 1880, 2100, 2250, 2180, 2350]
    },
    subjects: [
      { name: 'Mathematics', students: 85, avgGrade: 82, completion: 76 },
      { name: 'Physics', students: 62, avgGrade: 78, completion: 71 },
      { name: 'Chemistry', students: 54, avgGrade: 81, completion: 79 },
      { name: 'Biology', students: 48, avgGrade: 84, completion: 82 },
      { name: 'English', students: 72, avgGrade: 88, completion: 85 },
      { name: 'History', students: 45, avgGrade: 79, completion: 73 },
      { name: 'Computer Science', students: 38, avgGrade: 91, completion: 89 }
    ],
    recentActivity: [
      { id: 1, type: 'assignment', user: 'John Doe', action: 'submitted assignment', subject: 'Mathematics', time: '5 min ago' },
      { id: 2, type: 'message', user: 'Sarah Smith', action: 'sent a message', subject: 'Physics', time: '12 min ago' },
      { id: 3, type: 'enrollment', user: 'Mike Johnson', action: 'enrolled in', subject: 'Computer Science', time: '25 min ago' },
      { id: 4, type: 'grade', user: 'Emily Brown', action: 'received grade', subject: 'Chemistry', time: '1 hour ago' },
      { id: 5, type: 'attendance', user: 'David Wilson', action: 'marked present', subject: 'Biology', time: '2 hours ago' }
    ],
    topPerformers: [
      { name: 'Alice Cooper', grade: 98, subject: 'Computer Science', trend: 'up' },
      { name: 'Bob Martin', grade: 96, subject: 'Mathematics', trend: 'up' },
      { name: 'Carol White', grade: 95, subject: 'English', trend: 'stable' },
      { name: 'Dan Brown', grade: 94, subject: 'Physics', trend: 'up' },
      { name: 'Eve Adams', grade: 93, subject: 'Chemistry', trend: 'down' }
    ],
    alerts: [
      { id: 1, type: 'warning', message: '5 students have low attendance', time: '2 hours ago' },
      { id: 2, type: 'info', message: '3 assignments due tomorrow', time: '3 hours ago' },
      { id: 3, type: 'success', message: 'New course material uploaded', time: '5 hours ago' }
    ]
  });

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleExport = () => {
    // Simulate export functionality
    alert('Exporting analytics data...');
  };

  const timeRanges = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const metrics = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'engagement', label: 'Engagement', icon: Activity },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'subjects', label: 'Subject Analysis', icon: PieChart }
  ];

  // Calculate percentage for progress bars
  const getPercentage = (value, total) => {
    return (value / total) * 100;
  };

  // Get trend icon and color
  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp size={16} className="trend-up" />;
    if (trend === 'down') return <TrendingDown size={16} className="trend-down" />;
    return null;
  };

  // Get alert icon based on type
  const getAlertIcon = (type) => {
    switch(type) {
      case 'warning': return <AlertCircle size={18} className="alert-warning" />;
      case 'info': return <HelpCircle size={18} className="alert-info" />;
      case 'success': return <CheckCircle size={18} className="alert-success" />;
      default: return <AlertCircle size={18} />;
    }
  };

  return (
    <div className={`analytics-container ${collapsed ? 'analytics-container-collapsed' : ''}`}>
      <div className="analytics-wrapper">
        {/* Header */}
        <div className="analytics-header">
          <div className="header-left">
            <h1 className="analytics-title">Analytics Dashboard</h1>
            <p className="analytics-subtitle">Monitor your educational metrics and performance</p>
          </div>
          <div className="header-actions">
            {/* Time Range Selector */}
            <div className="time-range-selector">
              {timeRanges.map(range => (
                <button
                  key={range.value}
                  className={`time-range-btn ${timeRange === range.value ? 'active' : ''}`}
                  onClick={() => setTimeRange(range.value)}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <button 
              className="action-btn filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Filters</span>
              <ChevronDown size={16} className={`chevron ${showFilters ? 'rotated' : ''}`} />
            </button>

            <button 
              className="action-btn export-btn"
              onClick={handleExport}
            >
              <Download size={18} />
              <span>Export</span>
            </button>

            <button 
              className={`action-btn refresh-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label className="filter-label">Date Range</label>
              <select className="filter-select">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Custom range</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Subject</label>
              <select className="filter-select">
                <option>All Subjects</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Grade Level</label>
              <select className="filter-select">
                <option>All Levels</option>
                <option>Grade 9</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Teacher</label>
              <select className="filter-select">
                <option>All Teachers</option>
                <option>John Smith</option>
                <option>Sarah Johnson</option>
                <option>Mike Williams</option>
              </select>
            </div>
          </div>
        )}

        {/* Metrics Navigation */}
        <div className="metrics-nav">
          {metrics.map(metric => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.id}
                className={`metric-nav-btn ${selectedMetric === metric.id ? 'active' : ''}`}
                onClick={() => setSelectedMetric(metric.id)}
              >
                <Icon size={18} />
                <span>{metric.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="analytics-content">
          {/* Overview Metrics */}
          {selectedMetric === 'overview' && (
            <>
              {/* KPI Cards */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon students">
                    <Users size={24} />
                  </div>
                  <div className="kpi-info">
                    <h3 className="kpi-title">Total Students</h3>
                    <p className="kpi-value">{analyticsData.overview.totalStudents}</p>
                    <p className="kpi-trend positive">
                      {getTrendIcon('up')}
                      {analyticsData.trends.studentsChange} from last {timeRange}
                    </p>
                  </div>
                  <button className="kpi-more">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon teachers">
                    <GraduationCap size={24} />
                  </div>
                  <div className="kpi-info">
                    <h3 className="kpi-title">Active Teachers</h3>
                    <p className="kpi-value">{analyticsData.overview.totalTeachers}</p>
                    <p className="kpi-trend positive">
                      {getTrendIcon('up')}
                      {analyticsData.trends.teachersChange} from last {timeRange}
                    </p>
                  </div>
                  <button className="kpi-more">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon courses">
                    <BookOpen size={24} />
                  </div>
                  <div className="kpi-info">
                    <h3 className="kpi-title">Active Courses</h3>
                    <p className="kpi-value">{analyticsData.overview.totalCourses}</p>
                    <p className="kpi-trend positive">
                      {getTrendIcon('up')}
                      {analyticsData.trends.coursesChange} from last {timeRange}
                    </p>
                  </div>
                  <button className="kpi-more">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon completion">
                    <Award size={24} />
                  </div>
                  <div className="kpi-info">
                    <h3 className="kpi-title">Completion Rate</h3>
                    <p className="kpi-value">{analyticsData.overview.completionRate}%</p>
                    <p className="kpi-trend positive">
                      {getTrendIcon('up')}
                      {analyticsData.trends.completionChange} from last {timeRange}
                    </p>
                  </div>
                  <button className="kpi-more">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon grade">
                    <Target size={24} />
                  </div>
                  <div className="kpi-info">
                    <h3 className="kpi-title">Average Grade</h3>
                    <p className="kpi-value">{analyticsData.overview.averageGrade}%</p>
                    <p className="kpi-trend positive">
                      {getTrendIcon('up')}
                      {analyticsData.trends.gradeChange} from last {timeRange}
                    </p>
                  </div>
                  <button className="kpi-more">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon messages">
                    <MessageSquare size={24} />
                  </div>
                  <div className="kpi-info">
                    <h3 className="kpi-title">Messages</h3>
                    <p className="kpi-value">{analyticsData.overview.totalMessages}</p>
                    <p className="kpi-trend positive">
                      {getTrendIcon('up')}
                      {analyticsData.trends.messagesChange} from last {timeRange}
                    </p>
                  </div>
                  <button className="kpi-more">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                {/* Activity Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">Student Activity</h3>
                    <div className="chart-actions">
                      <button className="chart-action">
                        <Download size={16} />
                      </button>
                      <button className="chart-action">
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="chart-container">
                    <div className="bar-chart">
                      {analyticsData.performance[timeRange === 'week' ? 'weekly' : timeRange === 'month' ? 'monthly' : 'daily'].map((value, index) => (
                        <div key={index} className="bar-wrapper">
                          <div className="bar" style={{ height: `${value / 10}px` }}>
                            <span className="bar-value">{value}</span>
                          </div>
                          <span className="bar-label">
                            {timeRange === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] :
                             timeRange === 'month' ? `W${index + 1}` : `${index + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subject Distribution */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">Subject Distribution</h3>
                    <div className="chart-actions">
                      <button className="chart-action">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="chart-container">
                    <div className="donut-chart">
                      <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" strokeWidth="10" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="var(--accent-primary)"
                          strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 40 * 0.65} ${2 * Math.PI * 40 * 0.35}`}
                          strokeDashoffset={2 * Math.PI * 40 * 0.25}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="donut-center">
                        <span className="donut-value">65%</span>
                        <span className="donut-label">Completion</span>
                      </div>
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <span className="legend-color math"></span>
                        <span>Mathematics (35%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color science"></span>
                        <span>Sciences (28%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color humanities"></span>
                        <span>Humanities (22%)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color others"></span>
                        <span>Others (15%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tables Row */}
              <div className="tables-row">
                {/* Subject Performance Table */}
                <div className="table-card">
                  <div className="table-header">
                    <h3 className="table-title">Subject Performance</h3>
                    <button className="view-all-btn">View All</button>
                  </div>
                  <div className="table-container">
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Students</th>
                          <th>Avg. Grade</th>
                          <th>Completion</th>
                          <th>Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.subjects.map((subject, index) => (
                          <tr key={index}>
                            <td>{subject.name}</td>
                            <td>{subject.students}</td>
                            <td>
                              <span className={`grade-badge ${subject.avgGrade >= 90 ? 'excellent' : subject.avgGrade >= 80 ? 'good' : 'average'}`}>
                                {subject.avgGrade}%
                              </span>
                            </td>
                            <td>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill" 
                                  style={{ width: `${subject.completion}%` }}
                                ></div>
                                <span className="progress-text">{subject.completion}%</span>
                              </div>
                            </td>
                            <td>
                              {subject.avgGrade > 85 ? 
                                <TrendingUp size={16} className="trend-up" /> : 
                                subject.avgGrade > 80 ? 
                                <Activity size={16} className="trend-stable" /> : 
                                <TrendingDown size={16} className="trend-down" />
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-card">
                  <div className="activity-header">
                    <h3 className="activity-title">Recent Activity</h3>
                    <button className="view-all-btn">View All</button>
                  </div>
                  <div className="activity-list">
                    {analyticsData.recentActivity.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className={`activity-icon ${activity.type}`}>
                          {activity.type === 'assignment' && <FileText size={16} />}
                          {activity.type === 'message' && <MessageSquare size={16} />}
                          {activity.type === 'enrollment' && <Users size={16} />}
                          {activity.type === 'grade' && <Award size={16} />}
                          {activity.type === 'attendance' && <Clock size={16} />}
                        </div>
                        <div className="activity-content">
                          <p className="activity-text">
                            <strong>{activity.user}</strong> {activity.action} <strong>{activity.subject}</strong>
                          </p>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="bottom-row">
                {/* Top Performers */}
                <div className="performers-card">
                  <div className="performers-header">
                    <h3 className="performers-title">Top Performers</h3>
                    <Award size={20} className="performers-icon" />
                  </div>
                  <div className="performers-list">
                    {analyticsData.topPerformers.map((performer, index) => (
                      <div key={index} className="performer-item">
                        <div className="performer-rank">{index + 1}</div>
                        <div className="performer-info">
                          <p className="performer-name">{performer.name}</p>
                          <p className="performer-subject">{performer.subject}</p>
                        </div>
                        <div className="performer-grade">
                          <span className="grade-value">{performer.grade}%</span>
                          {getTrendIcon(performer.trend)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alerts */}
                <div className="alerts-card">
                  <div className="alerts-header">
                    <h3 className="alerts-title">Alerts & Notifications</h3>
                    <AlertCircle size={20} className="alerts-icon" />
                  </div>
                  <div className="alerts-list">
                    {analyticsData.alerts.map(alert => (
                      <div key={alert.id} className={`alert-item ${alert.type}`}>
                        {getAlertIcon(alert.type)}
                        <div className="alert-content">
                          <p className="alert-message">{alert.message}</p>
                          <span className="alert-time">{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="quick-stats-card">
                  <h3 className="quick-stats-title">Quick Stats</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <Eye size={16} />
                      <div>
                        <span className="stat-label">Page Views</span>
                        <span className="stat-value">12.5k</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <ThumbsUp size={16} />
                      <div>
                        <span className="stat-label">Engagement</span>
                        <span className="stat-value">85%</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <Clock size={16} />
                      <div>
                        <span className="stat-label">Avg. Time</span>
                        <span className="stat-value">24m</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <Zap size={16} />
                      <div>
                        <span className="stat-label">Active Now</span>
                        <span className="stat-value">127</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Engagement Metrics */}
          {selectedMetric === 'engagement' && (
            <div className="engagement-section">
              <h2 className="section-placeholder">Engagement Analytics Coming Soon</h2>
            </div>
          )}

          {/* Performance Metrics */}
          {selectedMetric === 'performance' && (
            <div className="performance-section">
              <h2 className="section-placeholder">Performance Analytics Coming Soon</h2>
            </div>
          )}

          {/* Subject Analysis */}
          {selectedMetric === 'subjects' && (
            <div className="subjects-section">
              <h2 className="section-placeholder">Subject Analysis Coming Soon</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;