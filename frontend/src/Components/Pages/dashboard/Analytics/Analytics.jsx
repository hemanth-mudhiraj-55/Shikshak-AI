import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../../../services/api';
import {
  BarChart3,
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
  const refreshTimerRef = useRef(null);

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, []);

  const [filters, setFilters] = useState({
    subject: 'All Subjects',
  });

  const fetchSummary = async () => {
    try {
      setError('');
      setIsLoading(true);
      const response = await api.get(`/analytics/summary?range=${encodeURIComponent(timeRange)}&subject=${encodeURIComponent(filters.subject)}`);
      if (response.success) {
        setSummary(response.data.data);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [timeRange, filters.subject]);

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      timeRange,
      selectedMetric,
      filters,
      summary
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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

  const overview = summary?.overview || {};
  const upcomingEvents = summary?.upcomingEvents || [];
  const activity = summary?.recentActivity || [];
  const labels = summary?.performance?.labels || [];
  const series = summary?.performance?.series || [];
  const seriesMax = Math.max(1, ...series);

  const todoCompletion = overview.totalTodos > 0
    ? Math.round((overview.completedTasks / overview.totalTodos) * 100)
    : 0;

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
    <div className={`analytics-container analytics-scope ${collapsed ? 'analytics-container-collapsed' : ''}`}>
      <div className="analytics-wrapper">
        {/* Header */}
        <div className="analytics-header">
          <div className="header-left">
            <h1 className="analytics-title">Analytics Dashboard</h1>
            <p className="analytics-subtitle">Track your progress, tasks, and study activity</p>
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
              onClick={fetchSummary}
              disabled={isLoading}
            >
              <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="filters-panel">
            <div className="filter-group">
              <label className="filter-label">Error</label>
              <div style={{ color: 'var(--danger-color)' }}>{error}</div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label className="filter-label">Date Range</label>
              <select
                className="filter-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Subject</label>
              <select
                className="filter-select"
                value={filters.subject}
                onChange={(e) => setFilters((prev) => ({ ...prev, subject: e.target.value }))}
              >
                <option>All Subjects</option>
                <option>General</option>
                <option>Messages</option>
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
                    <h3 className="kpi-title">My Teachers</h3>
                    <p className="kpi-value">{overview.myTeachers || 0}</p>
                    <p className="kpi-trend neutral">
                      <Clock size={16} /> Saved in my list
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
                    <h3 className="kpi-title">Homework Items</h3>
                    <p className="kpi-value">{overview.homeworkCount || 0}</p>
                    <p className="kpi-trend neutral">
                      <Clock size={16} /> Assigned to me
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
                    <h3 className="kpi-title">Books This Month</h3>
                    <p className="kpi-value">{overview.myBooksThisMonth || 0}</p>
                    <p className="kpi-trend neutral">
                      <Clock size={16} /> Monthly reading
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
                    <h3 className="kpi-title">Reading Streak</h3>
                    <p className="kpi-value">{overview.myReadingStreak || 0} days</p>
                    <p className="kpi-trend neutral">
                      <Clock size={16} /> Keep it going
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
                    <h3 className="kpi-title">Pages Read</h3>
                    <p className="kpi-value">{overview.myTotalPagesRead || 0}</p>
                    <p className="kpi-trend neutral">
                      <Clock size={16} /> Total so far
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
                    <h3 className="kpi-title">Unread Messages</h3>
                    <p className="kpi-value">{overview.unreadMessages || 0}</p>
                    <p className="kpi-trend neutral">
                      <AlertCircle size={16} /> Check your inbox
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
                      <h3 className="chart-title">My Activity</h3>
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
                      {series.map((value, index) => (
                        <div key={index} className="bar-wrapper">
                          <div className="bar" style={{ height: `${Math.max(6, (value / seriesMax) * 120)}px` }}>
                            <span className="bar-value">{value}</span>
                          </div>
                          <span className="bar-label">
                            {labels[index] || ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subject Distribution */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">Task Completion</h3>
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
                          strokeDasharray={`${2 * Math.PI * 40 * (todoCompletion / 100)} ${2 * Math.PI * 40 * (1 - todoCompletion / 100)}`}
                          strokeDashoffset={2 * Math.PI * 40 * 0.25}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="donut-center">
                        <span className="donut-value">{todoCompletion}%</span>
                        <span className="donut-label">Todos Done</span>
                      </div>
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <span className="legend-color"></span>
                        <span>{overview.completedTasks || 0} completed</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color"></span>
                        <span>{overview.pendingTasks || 0} pending</span>
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
                    <h3 className="table-title">Upcoming Events</h3>
                    <button className="view-all-btn">View All</button>
                  </div>
                  <div className="table-container">
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                          <tr key={event._id || event.id}>
                            <td>{event.title}</td>
                            <td>{event.date}</td>
                            <td>{event.time || '-'}</td>
                            <td>{event.type || '-'}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4}>No upcoming events</td>
                          </tr>
                        )}
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
                    {activity.map(activity => (
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
                          <span className="activity-time">{new Date(activity.time).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="bottom-row">
                {/* Quick Stats */}
                <div className="quick-stats-card">
                  <h3 className="quick-stats-title">Quick Stats</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <Eye size={16} />
                      <div>
                        <span className="stat-label">Upcoming Exams</span>
                        <span className="stat-value">{overview.upcomingExams || 0}</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <Clock size={16} />
                      <div>
                        <span className="stat-label">Pending Tasks</span>
                        <span className="stat-value">{overview.pendingTasks || 0}</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <Zap size={16} />
                      <div>
                        <span className="stat-label">Bot Quota</span>
                        <span className="stat-value">Coming soon</span>
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
