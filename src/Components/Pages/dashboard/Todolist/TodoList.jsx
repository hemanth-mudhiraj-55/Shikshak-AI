import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../../../services/api';
import { 
  Plus, 
  Check, 
  Trash2, 
  Calendar as CalendarIcon, 
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Clock,
  Flag,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { FaChevronDown } from "react-icons/fa";
import './TodoList.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data.data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  const addTodo = async () => {
  if (!newTodo.trim()) return;

  try {
    const response = await api.post('/todos', {
      text: newTodo,
      priority,
      dueDate
    });

    const savedTodo = response.data.data;

    setTodos(prev => [savedTodo, ...prev]);

    setNewTodo('');
    setDueDate('');
    setPriority('medium');

  } catch (error) {
    console.error('Failed to add todo:', error);
  }
};

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id) => {
    if (editText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, text: editText } : todo
      ));
      setEditingId(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getFilteredAndSortedTodos = () => {
    let filtered = [...todos];

    if (filter === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(todo => todo.priority === priorityFilter);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'priority':
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
          break;
        case 'status':
          comparison = (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
          break;
        case 'created':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <Flag size={14} className="priority-icon high" />;
      case 'medium': return <Flag size={14} className="priority-icon medium" />;
      case 'low': return <Flag size={14} className="priority-icon low" />;
      default: return null;
    }
  };

  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const highPriority = todos.filter(t => !t.completed && t.priority === 'high').length;
    const overdue = todos.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;
    
    return { total, completed, active, highPriority, overdue };
  };

  const stats = getStats();
  const filteredTodos = getFilteredAndSortedTodos();

  const getSortIcon = () => {
    if (sortOrder === 'asc') return <ArrowUp size={16} />;
    return <ArrowDown size={16} />;
  };

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h2 className="todo-title">To Do List</h2>
        <div className="todo-stats">
          <span className="stat-item">Total: {stats.total}</span>
          <span className="stat-item active">Active: {stats.active}</span>
          <span className="stat-item completed">Completed: {stats.completed}</span>
          {stats.highPriority > 0 && (
            <span className="stat-item high-priority">High: {stats.highPriority}</span>
          )}
          {stats.overdue > 0 && (
            <span className="stat-item overdue">Overdue: {stats.overdue}</span>
          )}
        </div>
      </div>

      <div className="todo-input-section">
        <input
          type="text"
          className="todo-input"
          placeholder="Add a new task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <select
          className="priority-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <input
          type="date"
          className="date-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button className="add-button" onClick={addTodo}>
          <Plus size={20} />
          Add
        </button>
      </div>

{/* Main Controls Bar */}
<div className="controls-bar">
  <div className="filters-group">
    <button
      className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
      onClick={() => setFilter('all')}
    >
      All
    </button>
    <button
      className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
      onClick={() => setFilter('active')}
    >
      Active
    </button>
    <button
      className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
      onClick={() => setFilter('completed')}
    >
      Completed
    </button>
  </div>

  <div className="sort-group">
    <button 
      className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
      onClick={() => setShowFilters(!showFilters)}
    >
      <Filter size={16} />
      <span>Filters</span>
      {priorityFilter !== 'all' && (
        <span className="filter-badge">1</span>
      )}
    </button>

    <div className="sort-select-wrapper">
      <select
        className="sort-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="date">Due Date</option>
        <option value="priority">Priority</option>
        <option value="status">Status</option>
        <option value="created">Created</option>
      </select>
      <FaChevronDown className="dropdown-icon" />
    </div>

    <button className="sort-order-btn" onClick={toggleSortOrder} title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}>
      {getSortIcon()}
    </button>
  </div>
</div>

      {/* Advanced Filters - Slides down below */}
      {showFilters && (
        <div className="advanced-filters-panel">
          <div className="priority-filter">
            <span className="filter-label">Priority:</span>
            <div className="priority-options">
              <button
                className={`priority-option ${priorityFilter === 'all' ? 'active' : ''}`}
                onClick={() => setPriorityFilter('all')}
              >
                All
              </button>
              <button
                className={`priority-option high ${priorityFilter === 'high' ? 'active' : ''}`}
                onClick={() => setPriorityFilter('high')}
              >
                🔴 High
              </button>
              <button
                className={`priority-option medium ${priorityFilter === 'medium' ? 'active' : ''}`}
                onClick={() => setPriorityFilter('medium')}
              >
                🟡 Medium
              </button>
              <button
                className={`priority-option low ${priorityFilter === 'low' ? 'active' : ''}`}
                onClick={() => setPriorityFilter('low')}
              >
                🟢 Low
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="todo-list">
        {filteredTodos.map(todo => (
          <div
            key={todo._id}
            className={`todo-item ${todo.completed ? 'completed' : ''} ${
              new Date(todo.dueDate) < new Date() && !todo.completed ? 'overdue' : ''
            }`}
          >
            <button
              className="todo-checkbox"
              onClick={() => toggleTodo(todo._id)}
            >
              {todo.completed ? <Check size={18} /> : <div className="unchecked" />}
            </button>
            
            <div className="todo-content">
              {editingId === todo.id ? (
                <div className="edit-mode">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-input"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                  />
                  <button className="save-edit" onClick={() => saveEdit(todo.id)}>
                    <Save size={16} />
                  </button>
                  <button className="cancel-edit" onClick={cancelEdit}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="todo-text">{todo.text}</span>
                  <div className="todo-meta">
                    <span className={`priority-badge ${getPriorityClass(todo.priority)}`}>
                      {getPriorityIcon(todo.priority)}
                      {todo.priority}
                    </span>
                    <span className="due-date">
                      <CalendarIcon size={14} />
                      {new Date(todo.dueDate).toLocaleDateString()}
                      {new Date(todo.dueDate) < new Date() && !todo.completed && (
                        <span className="overdue-label">Overdue</span>
                      )}
                    </span>
                    <span className="created-date">
                      <Clock size={14} />
                      {new Date(todo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="todo-actions">
              {!editingId && (
                <button
                  className="edit-button"
                  onClick={() => startEditing(todo)}
                >
                  <Edit2 size={16} />
                </button>
              )}
              <button
                className="delete-button"
                onClick={() => deleteTodo(todo._id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filteredTodos.length === 0 && (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>No tasks found</p>
            <button className="clear-filters" onClick={() => {
              setFilter('all');
              setPriorityFilter('all');
              setSortBy('date');
            }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {todos.length > 0 && (
        <div className="todo-footer">
          <span className="items-left">{stats.active} items left</span>
          <button 
            className="clear-completed"
            onClick={() => setTodos(todos.filter(t => !t.completed))}
          >
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
};

export default TodoList;