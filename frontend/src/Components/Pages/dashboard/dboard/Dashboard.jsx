import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../../services/api';
import {
  Users,
  Book,
  ListCheck,
  MessageSquare,
  Calendar,
  TrendingUp,
  RefreshCw,
  Clock,
  AlertCircle
} from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  const fetchStats = async () => {
    try {
      setDashboardError('');
      setDashboardLoading(true);
      const response = await api.get('/dashboard/stats');
      if (response.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setDashboardError(error?.message || 'Failed to load dashboard.');
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = dashboardStats || {};
  const upcomingEvents = stats.upcomingEvents || [];
  const tasks = stats.recentTodos || [];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button
          className="view-all"
          onClick={fetchStats}
          disabled={dashboardLoading}
          title="Refresh dashboard"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {dashboardError && (
        <div className="empty-state">
          <p>{dashboardError}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper teachers">
            <Users className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">My Teachers</h3>
            <p className="stat-value">{stats.myTeachers || 0}</p>
            <span className="stat-trend positive">
              <TrendingUp size={16} /> Saved in my list
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper books">
            <Book className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">Books This Month</h3>
            <p className="stat-value">{stats.myBooksThisMonth || 0}</p>
            <span className="stat-trend neutral">
              <Clock size={16} /> Monthly reading
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper tasks">
            <ListCheck className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">Pending Tasks</h3>
            <p className="stat-value">{stats.pendingTasks || 0}</p>
            <span className="stat-trend neutral">
              <Clock size={16} /> {tasks.length} total tasks
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper messages">
            <MessageSquare className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">Unread Messages</h3>
            <p className="stat-value">{stats.unreadMessages || 0}</p>
            <span className="stat-trend neutral">
              <AlertCircle size={16} /> Messages pending
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper events">
            <Calendar className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">Upcoming Events</h3>
            <p className="stat-value">{upcomingEvents.length}</p>
            <span className="stat-trend neutral">
              <Clock size={16} /> {upcomingEvents.length > 0 ? `Next: ${upcomingEvents[0]?.title}` : 'No upcoming events'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* To-Do List */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">To-Do List</h2>
            <button className="add-task" onClick={() => navigate('/dashboard/todolist')}>+ Add Task</button>
          </div>
          <div className="task-list">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div key={task._id || task.id} className="task-item">
                  <label className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                    />
                    <span className="checkmark"></span>
                  </label>
                  <div className="task-content">
                    <p className={`task-title ${task.completed ? 'completed' : ''}`}>
                      {task.title || task.text}
                    </p>
                    <div className="task-meta">
                      <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="due-date">{task.dueDate || ''}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No tasks yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Events</h2>
            <button className="view-all" onClick={() => navigate('/dashboard/calendar')}>View Calendar</button>
          </div>
          <div className="events-list">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div key={event._id || event.id} className="event-item">
                  <div className={`event-priority ${event.priority || 'medium'}`}></div>
                  <div className="event-details">
                    <h4 className="event-title">{event.title}</h4>
                    <p className="event-datetime">
                      {event.date} {event.time ? `at ${event.time}` : ''}
                    </p>
                  </div>
                  <button className="event-reminder">
                    <Clock size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
