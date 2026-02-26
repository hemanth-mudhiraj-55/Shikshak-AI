import React, { useState, useEffect } from 'react';
import {
  Users,
  Book,
  ListCheck,
  CreditCard,
  MessageSquare,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    teachers: 24,
    books: 156,
    tasks: 84,
    transactions: 45000,
    messages: 12,
    events: 8
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'teacher', action: 'New teacher joined', name: 'Dr. Sharma', time: '5 min ago', icon: Users },
    { id: 2, type: 'book', action: 'Book added', name: 'Mathematics', time: '1 hour ago', icon: Book },
    { id: 3, type: 'task', action: 'Task completed', name: 'Lesson planning', time: '2 hours ago', icon: ListCheck },
    { id: 4, type: 'message', action: 'New message', name: 'Parent inquiry', time: '3 hours ago', icon: MessageSquare },
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: 'Staff Meeting', time: '10:00 AM', date: 'Today', priority: 'high' },
    { id: 2, title: 'Parent-Teacher Meet', time: '2:00 PM', date: 'Tomorrow', priority: 'medium' },
    { id: 3, title: 'Curriculum Review', time: '11:00 AM', date: 'Wed, 15 Mar', priority: 'low' },
  ]);

  const [teacherRequests, setTeacherRequests] = useState([
    { id: 1, name: 'Prof. Rajesh Kumar', subject: 'Mathematics', status: 'pending', experience: '8 years' },
    { id: 2, name: 'Dr. Priya Singh', subject: 'Physics', status: 'pending', experience: '5 years' },
    { id: 3, name: 'Ms. Anjali Mehta', subject: 'English', status: 'pending', experience: '3 years' },
  ]);

  const [recentBooks, setRecentBooks] = useState([
    { id: 1, title: 'Advanced Mathematics', author: 'R.D. Sharma', copies: 45, borrowed: 12 },
    { id: 2, title: 'Physics for Class 12', author: 'H.C. Verma', copies: 38, borrowed: 8 },
    { id: 3, title: 'English Literature', author: 'William Wordsworth', copies: 52, borrowed: 15 },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Prepare lesson plans', completed: false, priority: 'high', dueDate: 'Today' },
    { id: 2, title: 'Grade test papers', completed: true, priority: 'medium', dueDate: 'Yesterday' },
    { id: 3, title: 'Schedule parent meetings', completed: false, priority: 'high', dueDate: 'Tomorrow' },
    { id: 4, title: 'Update student records', completed: false, priority: 'low', dueDate: 'This week' },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Parent Council', message: 'Request for meeting regarding annual day', time: '10:30 AM', unread: true },
    { id: 2, sender: 'Principal', message: 'Please review the new curriculum guidelines', time: '9:15 AM', unread: true },
    { id: 3, sender: 'HR Department', message: 'Teacher training schedule for next month', time: 'Yesterday', unread: false },
  ]);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

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
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper teachers">
            <Users className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">Total Teachers</h3>
            <p className="stat-value">{stats.teachers}</p>
            <span className="stat-trend positive">
              <TrendingUp size={16} /> +12% this month
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper books">
            <Book className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">Total Books</h3>
            <p className="stat-value">{stats.books}</p>
            <span className="stat-trend positive">
              <TrendingUp size={16} /> +8 new this week
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper tasks">
            <ListCheck className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">Pending Tasks</h3>
            <p className="stat-value">{tasks.filter(t => !t.completed).length}</p>
            <span className="stat-trend neutral">
              <Clock size={16} /> {tasks.length} total tasks
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper transactions">
            <CreditCard className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">Revenue</h3>
            <p className="stat-value">₹{stats.transactions.toLocaleString()}</p>
            <span className="stat-trend positive">
              <TrendingUp size={16} /> +23% vs last month
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper messages">
            <MessageSquare className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">Unread Messages</h3>
            <p className="stat-value">{messages.filter(m => m.unread).length}</p>
            <span className="stat-trend negative">
              <AlertCircle size={16} /> {messages.length} total
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper events">
            <Calendar className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-label">Upcoming Events</h3>
            <p className="stat-value">{stats.events}</p>
            <span className="stat-trend neutral">
              <Clock size={16} /> Next: Staff Meeting
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Recent Activities</h2>
            <button className="card-menu">
              <MoreVertical size={18} />
            </button>
          </div>
          <div className="activity-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  <activity.icon size={16} />
                </div>
                <div className="activity-details">
                  <p className="activity-text">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-name">{activity.name}</span>
                  </p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Requests */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Teacher Requests</h2>
            <button className="view-all">View All</button>
          </div>
          <div className="request-list">
            {teacherRequests.map(request => (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <h4 className="request-name">{request.name}</h4>
                  <p className="request-details">{request.subject} • {request.experience}</p>
                </div>
                <div className="request-actions">
                  <span className="status-badge pending">Pending</span>
                  <button className="action-btn approve">✓</button>
                  <button className="action-btn reject">✗</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* To-Do List */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">To-Do List</h2>
            <button className="add-task">+ Add Task</button>
          </div>
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <label className="task-checkbox">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className="checkmark"></span>
                </label>
                <div className="task-content">
                  <p className={`task-title ${task.completed ? 'completed' : ''}`}>
                    {task.title}
                  </p>
                  <div className="task-meta">
                    <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="due-date">{task.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Books */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Recent Books</h2>
            <button className="view-all">View All</button>
          </div>
          <div className="books-list">
            {recentBooks.map(book => (
              <div key={book.id} className="book-item">
                <div className="book-cover">
                  <Book size={24} />
                </div>
                <div className="book-details">
                  <h4 className="book-title">{book.title}</h4>
                  <p className="book-author">by {book.author}</p>
                  <div className="book-stats">
                    <span className="stat">
                      <CheckCircle size={14} /> {book.copies - book.borrowed} available
                    </span>
                    <span className="stat">
                      <Users size={14} /> {book.borrowed} borrowed
                    </span>
                  </div>
                </div>
                <div className="book-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${(book.borrowed/book.copies) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Recent Messages</h2>
            <button className="view-all">View All</button>
          </div>
          <div className="message-list">
            {messages.map(message => (
              <div key={message.id} className={`message-item ${message.unread ? 'unread' : ''}`}>
                <div className="message-avatar">
                  {message.sender.charAt(0)}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <h4 className="message-sender">{message.sender}</h4>
                    <span className="message-time">{message.time}</span>
                  </div>
                  <p className="message-preview">{message.message}</p>
                </div>
                {message.unread && <span className="unread-dot"></span>}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Events</h2>
            <button className="view-all">View Calendar</button>
          </div>
          <div className="events-list">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-item">
                <div className={`event-priority ${event.priority}`}></div>
                <div className="event-details">
                  <h4 className="event-title">{event.title}</h4>
                  <p className="event-datetime">
                    {event.date} at {event.time}
                  </p>
                </div>
                <button className="event-reminder">
                  <Clock size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;