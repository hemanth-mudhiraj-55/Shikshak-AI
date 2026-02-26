import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Lock,
  Mail,
  Phone,
  Camera,
  Save,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  CreditCard,
  BookOpen,
  Clock,
  Languages,
  Volume2,
  Wifi,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit2
} from 'lucide-react';
import './Settings.css';

const Settings = ({ collapsed }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  // Mock user data
  const [userData, setUserData] = useState({
    profilePicture: 'https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff&size=128',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    username: 'johndoe',
    bio: 'Educator passionate about technology and student success. Teaching for over 5 years.',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    language: 'english',
    timezone: 'America/New_York',
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      sms: false,
      desktop: true,
      messages: true,
      assignments: true,
      announcements: true,
      reminders: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      onlineStatus: true,
      readReceipts: true,
      activityStatus: true
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      deviceManagement: true,
      sessionTimeout: '30',
      passwordLastChanged: '2024-01-15'
    }
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Form state for editing
  const [formData, setFormData] = useState({ ...userData });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleSecurityChange = (key) => {
    setFormData(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: !prev.security[key]
      }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      setUserData(formData);
      setIsEditing(false);
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }, 1500);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSaveStatus('success');
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }, 1500);
  };

  const handleCancel = () => {
    setFormData({ ...userData });
    setIsEditing(false);
    setSaveStatus(null);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Storage', icon: Download }
  ];

  return (
    <div className={`settings-container ${collapsed ? 'settings-container-collapsed' : ''}`}>
      <div className="settings-wrapper">
        {/* Header */}
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your account settings and preferences</p>
        </div>

        <div className="settings-content">
          {/* Sidebar Tabs */}
          <div className="settings-sidebar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'settings-tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                  <ChevronRight size={16} className="tab-chevron" />
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="settings-main">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2 className="section-title">Profile Information</h2>
                  {!isEditing ? (
                    <button 
                      className="edit-button"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 size={18} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button 
                        className="cancel-button"
                        onClick={handleCancel}
                      >
                        <XCircle size={18} />
                        Cancel
                      </button>
                      <button 
                        className="save-button"
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                      >
                        <Save size={18} />
                        {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Picture */}
                <div className="profile-picture-section">
                  <div className="profile-picture-wrapper">
                    <img 
                      src={formData.profilePicture} 
                      alt="Profile" 
                      className="profile-picture"
                    />
                    {isEditing && (
                      <label className="profile-picture-upload">
                        <Camera size={20} />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Profile Form */}
                <div className="settings-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        className="form-input"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        className="form-input"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      className="form-input"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        className="form-input with-icon"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input
                        type="tel"
                        name="phone"
                        className="form-input with-icon"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      className="form-textarea"
                      rows="4"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        className="form-input"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select
                        name="gender"
                        className="form-select"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2 className="section-title">Notification Preferences</h2>
                  <button 
                    className="save-button"
                    onClick={handleSave}
                  >
                    <Save size={18} />
                    Save Preferences
                  </button>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Notification Channels</h3>
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Email Notifications</span>
                        <span className="toggle-description">Receive updates via email</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.notifications.email}
                          onChange={() => handleNotificationChange('email')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Push Notifications</span>
                        <span className="toggle-description">Receive push notifications on your devices</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.notifications.push}
                          onChange={() => handleNotificationChange('push')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">SMS Notifications</span>
                        <span className="toggle-description">Receive text message alerts</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.notifications.sms}
                          onChange={() => handleNotificationChange('sms')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Desktop Notifications</span>
                        <span className="toggle-description">Show notifications on desktop</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.notifications.desktop}
                          onChange={() => handleNotificationChange('desktop')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Notification Types</h3>
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Messages</span>
                        <span className="toggle-description">New message notifications</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.notifications.messages}
                          onChange={() => handleNotificationChange('messages')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Assignments</span>
                        <span className="toggle-description">Assignment deadlines and updates</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.notifications.assignments}
                          onChange={() => handleNotificationChange('assignments')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Announcements</span>
                        <span className="toggle-description">Important announcements and updates</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.notifications.announcements}
                          onChange={() => handleNotificationChange('announcements')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Reminders</span>
                        <span className="toggle-description">Event and task reminders</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.notifications.reminders}
                          onChange={() => handleNotificationChange('reminders')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Tab */}
            {activeTab === 'privacy' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2 className="section-title">Privacy & Security</h2>
                  <button 
                    className="save-button"
                    onClick={handleSave}
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Profile Privacy</h3>
                  <div className="form-group">
                    <label className="form-label">Profile Visibility</label>
                    <select
                      className="form-select"
                      value={formData.privacy.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    >
                      <option value="public">Public - Everyone can see</option>
                      <option value="private">Private - Only teachers and students</option>
                      <option value="contacts">Contacts Only</option>
                    </select>
                  </div>

                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Show Email Address</span>
                        <span className="toggle-description">Display your email on your profile</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.privacy.showEmail}
                          onChange={() => handlePrivacyChange('showEmail', !formData.privacy.showEmail)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Show Phone Number</span>
                        <span className="toggle-description">Display your phone on your profile</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.privacy.showPhone}
                          onChange={() => handlePrivacyChange('showPhone', !formData.privacy.showPhone)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Online Status</span>
                        <span className="toggle-description">Show when you're online</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.privacy.onlineStatus}
                          onChange={() => handlePrivacyChange('onlineStatus', !formData.privacy.onlineStatus)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Read Receipts</span>
                        <span className="toggle-description">Let others know you've read their messages</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.privacy.readReceipts}
                          onChange={() => handlePrivacyChange('readReceipts', !formData.privacy.readReceipts)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Security Settings</h3>
                  
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Two-Factor Authentication</span>
                        <span className="toggle-description">Add an extra layer of security</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.security.twoFactorAuth}
                          onChange={() => handleSecurityChange('twoFactorAuth')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Login Alerts</span>
                        <span className="toggle-description">Get notified of new sign-ins</span>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={formData.security.loginAlerts}
                          onChange={() => handleSecurityChange('loginAlerts')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.security.sessionTimeout}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          sessionTimeout: e.target.value
                        }
                      }))}
                      min="5"
                      max="120"
                    />
                  </div>

                  <div className="info-text">
                    <Clock size={16} />
                    <span>Password last changed: {formData.security.passwordLastChanged}</span>
                  </div>
                </div>

                {/* Change Password Section */}
                <div className="settings-card">
                  <h3 className="card-title">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <div className="password-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="currentPassword"
                          className="form-input"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <div className="password-input">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="newPassword"
                          className="form-input"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <div className="password-input">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          className="form-input"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="update-password-button">
                      <Lock size={18} />
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2 className="section-title">Appearance</h2>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Theme</h3>
                  <div className="theme-options">
                    <label className={`theme-option ${formData.theme === 'light' ? 'theme-option-active' : ''}`}>
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={formData.theme === 'light'}
                        onChange={() => setFormData({...formData, theme: 'light'})}
                      />
                      <Sun size={24} />
                      <span>Light</span>
                    </label>

                    <label className={`theme-option ${formData.theme === 'dark' ? 'theme-option-active' : ''}`}>
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={formData.theme === 'dark'}
                        onChange={() => setFormData({...formData, theme: 'dark'})}
                      />
                      <Moon size={24} />
                      <span>Dark</span>
                    </label>

                    <label className={`theme-option ${formData.theme === 'system' ? 'theme-option-active' : ''}`}>
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={formData.theme === 'system'}
                        onChange={() => setFormData({...formData, theme: 'system'})}
                      />
                      <Globe size={24} />
                      <span>System</span>
                    </label>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Font Size</h3>
                  <div className="font-size-slider">
                    <span>A</span>
                    <input 
                      type="range" 
                      min="12" 
                      max="20" 
                      step="1"
                      value="14"
                      className="slider"
                    />
                    <span className="large-font">A</span>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Color Scheme</h3>
                  <div className="color-options">
                    <button className="color-option" style={{ backgroundColor: '#4f46e5' }} />
                    <button className="color-option" style={{ backgroundColor: '#10b981' }} />
                    <button className="color-option" style={{ backgroundColor: '#f59e0b' }} />
                    <button className="color-option" style={{ backgroundColor: '#ef4444' }} />
                    <button className="color-option" style={{ backgroundColor: '#8b5cf6' }} />
                    <button className="color-option" style={{ backgroundColor: '#ec4899' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2 className="section-title">Preferences</h2>
                  <button 
                    className="save-button"
                    onClick={handleSave}
                  >
                    <Save size={18} />
                    Save Preferences
                  </button>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Language & Region</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <div className="input-with-icon">
                      <Languages size={18} className="input-icon" />
                      <select
                        className="form-select with-icon"
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                        <option value="chinese">Chinese</option>
                        <option value="japanese">Japanese</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Time Zone</label>
                    <select
                      className="form-select"
                      value={formData.timezone}
                      onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      <option value="Europe/Paris">Central European Time (CET)</option>
                      <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                      <option value="Asia/Shanghai">China Standard Time (CST)</option>
                    </select>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Accessibility</h3>
                  
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Reduce Motion</span>
                        <span className="toggle-description">Minimize animations throughout the app</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">High Contrast</span>
                        <span className="toggle-description">Increase contrast for better visibility</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Screen Reader Optimization</span>
                        <span className="toggle-description">Optimize for screen readers</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Sound & Audio</h3>
                  
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Notification Sounds</span>
                        <span className="toggle-description">Play sounds for notifications</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Message Sounds</span>
                        <span className="toggle-description">Play sounds for new messages</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Volume</label>
                    <input type="range" min="0" max="100" className="slider" defaultValue="70" />
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2 className="section-title">Billing & Subscription</h2>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Current Plan</h3>
                  <div className="plan-info">
                    <div className="plan-badge">Pro Plan</div>
                    <p className="plan-price">$29.99 / month</p>
                    <p className="plan-dates">Next billing: March 15, 2024</p>
                  </div>
                  <button className="upgrade-button">
                    <CreditCard size={18} />
                    Upgrade Plan
                  </button>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Payment Methods</h3>
                  <div className="payment-method">
                    <CreditCard size={20} />
                    <span>•••• •••• •••• 4242</span>
                    <span className="payment-expiry">Expires 12/25</span>
                    <button className="payment-edit">Edit</button>
                  </div>
                  <button className="add-payment-button">
                    + Add Payment Method
                  </button>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Billing History</h3>
                  <div className="billing-history">
                    <div className="billing-item">
                      <span>February 15, 2024</span>
                      <span className="billing-amount">$29.99</span>
                      <span className="billing-status paid">Paid</span>
                    </div>
                    <div className="billing-item">
                      <span>January 15, 2024</span>
                      <span className="billing-amount">$29.99</span>
                      <span className="billing-status paid">Paid</span>
                    </div>
                    <div className="billing-item">
                      <span>December 15, 2023</span>
                      <span className="billing-amount">$29.99</span>
                      <span className="billing-status paid">Paid</span>
                    </div>
                  </div>
                  <button className="view-all-button">View All Invoices</button>
                </div>
              </div>
            )}

            {/* Data & Storage Tab */}
            {activeTab === 'data' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2 className="section-title">Data & Storage</h2>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Storage Usage</h3>
                  <div className="storage-info">
                    <div className="storage-bar">
                      <div className="storage-used" style={{ width: '45%' }}></div>
                    </div>
                    <div className="storage-details">
                      <span>45% used</span>
                      <span>4.5 GB of 10 GB</span>
                    </div>
                  </div>

                  <div className="storage-breakdown">
                    <div className="breakdown-item">
                      <BookOpen size={16} />
                      <span>Documents</span>
                      <span className="breakdown-size">2.1 GB</span>
                    </div>
                    <div className="breakdown-item">
                      <Image size={16} />
                      <span>Images</span>
                      <span className="breakdown-size">1.8 GB</span>
                    </div>
                    <div className="breakdown-item">
                      <Volume2 size={16} />
                      <span>Audio</span>
                      <span className="breakdown-size">0.6 GB</span>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Data Management</h3>
                  
                  <button className="data-action-button">
                    <Download size={18} />
                    Export All Data
                  </button>

                  <button className="data-action-button danger">
                    <Trash2 size={18} />
                    Clear Cache
                  </button>

                  <button className="data-action-button danger">
                    <Trash2 size={18} />
                    Delete Account
                  </button>
                </div>

                <div className="settings-card">
                  <h3 className="card-title">Privacy Controls</h3>
                  
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Usage Data Collection</span>
                        <span className="toggle-description">Help us improve by sharing anonymous usage data</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="toggle-item">
                      <div className="toggle-info">
                        <span className="toggle-label">Cookies</span>
                        <span className="toggle-description">Allow essential and functional cookies</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Status Notification */}
            {saveStatus && (
              <div className={`save-status ${saveStatus}`}>
                {saveStatus === 'saving' && (
                  <>
                    <div className="spinner"></div>
                    <span>Saving changes...</span>
                  </>
                )}
                {saveStatus === 'success' && (
                  <>
                    <CheckCircle size={20} />
                    <span>Changes saved successfully!</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;