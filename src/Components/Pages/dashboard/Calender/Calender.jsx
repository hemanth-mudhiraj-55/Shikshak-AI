import React, { useState,useEffect } from 'react';
import { api } from '../../../../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin
} from 'lucide-react';
import './Calender.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'meeting',
    description: '',
    location: ''
  });

  useEffect(() => {
  fetchEvents();
}, []);

const fetchEvents = async () => {
  try {
    const response = await api.get('/events');
    setEvents(response.data.data);
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }
};

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    setNewEvent({
      ...newEvent,
      date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
    setShowEventModal(true);
  };

const addEvent = async () => {
  if (!newEvent.title || !newEvent.date) return;

  try {
    const response = await api.post('/events', newEvent);

    setEvents(prev => [...prev, response.data.data]);

    setShowEventModal(false);
    setNewEvent({
      title: '',
      date: '',
      time: '',
      type: 'meeting',
      description: '',
      location: ''
    });

  } catch (error) {
    console.error('Failed to add event:', error);
  }
};

const deleteEvent = async (eventId) => {
  try {
    await api.delete(`/events/${eventId}`);
    setEvents(prev => prev.filter(event => event._id !== eventId));
  } catch (error) {
    console.error('Failed to delete event:', error);
  }
};

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Fill in the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateEvents = getEventsForDate(day);
      const isToday = 
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();
      
      const isSelected = 
        day === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {dateEvents.length > 0 && (
            <div className="event-indicators">
              {dateEvents.slice(0, 2).map((event, index) => (
                <div
                  key={index}
                  className={`event-indicator ${event.type}`}
                  title={event.title}
                />
              ))}
              {dateEvents.length > 2 && (
                <span className="more-indicator">+{dateEvents.length - 2}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2 className="calendar-title">Calendar</h2>
        <button className="add-event-button" onClick={() => setShowEventModal(true)}>
          <Plus size={20} />
          Add Event
        </button>
      </div>

      <div className="calendar-main">
        <div className="calendar-sidebar">
          <h3 className="sidebar-title">Upcoming Events</h3>
          <div className="events-list">
            {events
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(event => (
                <div key={event._id} className="event-card">
                  <div className={`event-type-indicator ${event.type}`} />
                  <div className="event-details">
                    <h4 className="event-title">{event.title}</h4>
                    <div className="event-meta">
                      <span className="event-meta-item">
                        <CalendarIcon size={14} />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="event-meta-item">
                        <Clock size={14} />
                        {event.time}
                      </span>
                      {event.location && (
                        <span className="event-meta-item">
                          <MapPin size={14} />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="delete-event"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="calendar-grid-container">
          <div className="calendar-navigation">
            <button onClick={prevMonth} className="nav-button">
              <ChevronLeft size={20} />
            </button>
            <h3 className="current-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button onClick={nextMonth} className="nav-button">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="weekdays">
            {dayNames.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {renderCalendar()}
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Event</h3>
              <button className="close-modal" onClick={() => setShowEventModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <input
                type="text"
                placeholder="Event Title"
                className="modal-input"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              
              <div className="modal-row">
                <input
                  type="date"
                  className="modal-input"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <input
                  type="time"
                  className="modal-input"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>

              <select
                className="modal-input"
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
              </select>

              <input
                type="text"
                placeholder="Location"
                className="modal-input"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />

              <textarea
                placeholder="Description"
                className="modal-textarea"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowEventModal(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={addEvent}>
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;