import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MoreVertical,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Clock,
  Star,
  Award,
  Calendar,
  Grid,
  List,
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  FileText,
  Upload,
  Video,
  Camera,
  User,
  Globe,
  Brain,
  Sparkles,
  Zap,
  Crown,
  FileUp,
  X
} from 'lucide-react';
import './Teachers.css';

const Teachers = ({ collapsed }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // Form state for new teacher
  const [newTeacher, setNewTeacher] = useState({
    aiTeacherName: '',
    subject: '',
    photo: null,
    video: null,
  });

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

  // Mock teachers data - simplified
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      aiTeacherName: 'Dr. Sarah Johnson',
      subject: 'Mathematics',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=4f46e5&color=fff&size=128',
  
    },
    {
      id: 2,
      aiTeacherName: 'Prof. Michael Chen',
      subject: 'Physics',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff&size=128',
          
    },
    {
      id: 3,
      aiTeacherName: 'Ms. Emily Williams',
      subject: 'English',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Williams&background=8b5cf6&color=fff&size=128',

    },
    {
      id: 4,
      aiTeacherName: 'Dr. David Brown',
      subject: 'Chemistry',
      avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=f59e0b&color=fff&size=128',
     
    },
    {
      id: 5,
      aiTeacherName: 'Prof. Lisa Anderson',
      subject: 'History',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=ef4444&color=fff&size=128',
 
    },
    {
      id: 6,
      aiTeacherName: 'Mr. Robert Taylor',
      subject: 'Physical Education',
      avatar: 'https://ui-avatars.com/api/?name=Robert+Taylor&background=ec4899&color=fff&size=128',
   
    }
  ]);

  // Filter teachers based on search
  const filteredTeachers = teachers.filter(teacher => {
    return teacher.aiTeacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherModal(true);
  };

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setNewTeacher({
      aiTeacherName: '',
      subject: '',
      photo: null,
      video: null,
      accountType: 'normal'
    });
    setPhotoFile(null);
    setVideoFile(null);
    setShowTeacherModal(true);
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setNewTeacher({
      aiTeacherName: teacher.aiTeacherName,
      subject: teacher.subject,
      photo: null,
      video: null,
      accountType: teacher.accountType || 'normal'
    });
    setShowTeacherModal(true);
  };

  const handleDeleteTeacher = (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(teachers.filter(t => t.id !== teacherId));
    }
  };

  const handleGenerateClick = (teacher) => {
    setSelectedTeacher(teacher);
    setPdfFile(null);
    setShowGenerateModal(true);
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert('PDF size should be less than 50MB');
        return;
      }
      setPdfFile(file);
      
      // Simulate upload progress
      simulateUpload('pdf', file);
    }
  };

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    if (!pdfFile) {
      alert('Please upload a PDF file');
      return;
    }
    
    // Here you would handle the PDF processing
    alert(`Generating content from ${pdfFile.name} for ${selectedTeacher?.aiTeacherName}`);
    setShowGenerateModal(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Photo size should be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setNewTeacher({ ...newTeacher, photo: URL.createObjectURL(file) });
      
      // Simulate upload progress
      simulateUpload('photo', file);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        alert('Video size should be less than 100MB');
        return;
      }
      setVideoFile(file);
      setNewTeacher({ ...newTeacher, video: file.name });
      
      // Simulate upload progress
      simulateUpload('video', file);
    }
  };

  const simulateUpload = (type, file) => {
    setUploadProgress({ ...uploadProgress, [type]: 0 });
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = (prev[type] || 0) + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return { ...prev, [type]: 100 };
        }
        return { ...prev, [type]: newProgress };
      });
    }, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newTeacher.aiTeacherName || !newTeacher.subject) {
      alert('Please fill in all required fields');
      return;
    }

    const newTeacherObj = {
      id: selectedTeacher ? selectedTeacher.id : teachers.length + 1,
      aiTeacherName: newTeacher.aiTeacherName,
      subject: newTeacher.subject,
      avatar: newTeacher.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(newTeacher.aiTeacherName)}&background=4f46e5&color=fff&size=128`,
      video: newTeacher.video,
      accountType: newTeacher.accountType
    };

    if (selectedTeacher) {
      // Edit existing teacher
      setTeachers(teachers.map(t => 
        t.id === selectedTeacher.id ? { ...t, ...newTeacherObj } : t
      ));
    } else {
      // Add new teacher
      setTeachers([...teachers, newTeacherObj]);
    }

    setShowTeacherModal(false);
  };



  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`teachers-container ${collapsed ? 'teachers-container-collapsed' : ''}`}>
      <div className="teachers-wrapper">
        {/* Header */}
        <div className="teachers-header">
          <div className="header-left">
            <h1 className="teachers-title">AI Teachers</h1>
            <p className="teachers-subtitle">Manage your AI teacher profiles</p>
          </div>
          <div className="header-actions">
            {/* View Toggle */}
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>

            {/* Add Teacher Button */}
            <button className="action-btn add-btn" onClick={handleAddTeacher}>
              <UserPlus size={18} />
              <span>Add AI Teacher</span>
            </button>
          </div>
        </div>

        {/* Search - Compact */}
        <div className="search-filters compact">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or subject..."
              className="search-input compact"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards - Compact */}
        <div className="stats-grid compact">
          <div className="stat-card compact">
            <div className="stat-icon total">
              <Users size={20} />
            </div>
            <div className="stat-info">
              <h3 className="stat-label">Total AI Teachers</h3>
              <p className="stat-value">{teachers.length}</p>
            </div>
          </div>
        </div>

        {/* Teachers Grid/List View */}
        <div className={`teachers-view ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
          {filteredTeachers.map(teacher => (
            <div key={teacher.id} className={`teacher-card ${viewMode}`}>
              {viewMode === 'grid' ? (
                /* Grid View - With Generate and Delete buttons */
                <>
                  <div className="teacher-card-header">
                    <div className="teacher-avatar-wrapper">
                      <img src={teacher.avatar} alt={teacher.aiTeacherName} className="teacher-avatar" />
                    </div>
                    <button className="teacher-menu">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="teacher-info">
                    <h3 className="teacher-name">{teacher.aiTeacherName}</h3>
                    <div className="teacher-badge">
                      <Brain size={12} />
                      <span>AI Teacher</span>
                    </div>
                    <p className="teacher-department">{teacher.subject}</p>
                    
                    {teacher.video && (
                      <div className="teacher-video-badge">
                        <Video size={12} />
                        <span>Video available</span>
                      </div>
                    )}
                  </div>

                  <div className="teacher-card-footer">
                    <button className="action-button generate" onClick={() => handleGenerateClick(teacher)}>
                      <FileUp size={14} />
                      <span>Generate</span>
                    </button>
                    <button className="action-button delete" onClick={() => handleDeleteTeacher(teacher.id)}>
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              ) : (
                /* List View - With Generate and Delete buttons */
                <>
                  <div className="teacher-list-row">
                    <div className="list-cell teacher-info-cell">
                      <div className="teacher-avatar-wrapper">
                        <img src={teacher.avatar} alt={teacher.aiTeacherName} className="teacher-avatar" />
                      </div>
                      <div className="teacher-name-info">
                        <h3 className="teacher-name">{teacher.aiTeacherName}</h3>
                        <div className="teacher-badge-small">
                          <Brain size={10} />
                          <span>AI Teacher</span>
                        </div>
                      </div>
                    </div>

                    <div className="list-cell department-cell">
                      <span className="department-badge">{teacher.subject}</span>
                    </div>

                    <div className="list-cell video-cell">
                      {teacher.video ? (
                        <div className="video-indicator">
                          <Video size={14} />
                          <span>Video</span>
                        </div>
                      ) : (
                        <span className="no-video">No video</span>
                      )}
                    </div>

                    <div className="list-cell actions-cell">
                      <button className="list-action-btn generate" onClick={() => handleGenerateClick(teacher)}>
                        <FileUp size={14} />
                        <span>Generate</span>
                      </button>
                      <button className="list-action-btn delete" onClick={() => handleDeleteTeacher(teacher.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add/Edit Teacher Modal */}
        {showTeacherModal && (
          <div className="modal-overlay" onClick={() => setShowTeacherModal(false)}>
            <div className="modal-content modal-content-wide" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {selectedTeacher ? 'Edit AI Teacher' : 'Add New AI Teacher'}
                </h2>
                <button className="modal-close" onClick={() => setShowTeacherModal(false)}>
                  <XCircle size={20} />
                </button>
              </div>

              <div className="add-teacher-form">
                <form onSubmit={handleSubmit}>
                  {/* AI Teacher Name Field */}
                  <div className="form-group highlight-field">
                    <label className="form-label">
                      <Brain size={16} />
                      AI Teacher Name <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Dr. Sarah Johnson AI"
                        value={newTeacher.aiTeacherName}
                        onChange={(e) => setNewTeacher({ ...newTeacher, aiTeacherName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="form-group">
                    <label className="form-label">
                      <BookOpen size={16} />
                      Subject <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <Globe size={16} className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Mathematics, Physics, Literature"
                        value={newTeacher.subject}
                        onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="form-group upload-group">
                    <label className="form-label">
                      <Camera size={16} />
                      Upload Photo <span className="optional">(optional, max 5MB)</span>
                    </label>
                    <div className="upload-area">
                      {newTeacher.photo ? (
                        <div className="upload-preview">
                          <img src={newTeacher.photo} alt="Preview" className="preview-image" />
                          <button 
                            type="button" 
                            className="remove-upload"
                            onClick={() => setNewTeacher({ ...newTeacher, photo: null })}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-label">
                          <div className="upload-content">
                            <Upload size={24} />
                            <span>Click to upload</span>
                            <span className="upload-hint">PNG, JPG, GIF up to 5MB</span>
                          </div>
                          <input
                            type="file"
                            className="upload-input"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      )}
                    </div>
                    {uploadProgress.photo > 0 && uploadProgress.photo < 100 && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${uploadProgress.photo}%` }}></div>
                        </div>
                        <span className="progress-text">{uploadProgress.photo}%</span>
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div className="form-group upload-group">
                    <label className="form-label">
                      <Video size={16} />
                      Upload Video <span className="optional">(optional, max 100MB)</span>
                    </label>
                    <div className="upload-area video-upload">
                      {videoFile ? (
                        <div className="video-preview">
                          <Video size={32} className="video-icon" />
                          <div className="video-info">
                            <span className="video-name">{videoFile.name}</span>
                            <span className="video-size">{formatFileSize(videoFile.size)}</span>
                          </div>
                          <button 
                            type="button" 
                            className="remove-upload"
                            onClick={() => {
                              setVideoFile(null);
                              setNewTeacher({ ...newTeacher, video: null });
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-label">
                          <div className="upload-content">
                            <Video size={24} />
                            <span>Click to upload video</span>
                            <span className="upload-hint">MP4, WebM, MOV up to 100MB</span>
                          </div>
                          <input
                            type="file"
                            className="upload-input"
                            accept="video/*"
                            onChange={handleVideoUpload}
                          />
                        </label>
                      )}
                    </div>
                    {uploadProgress.video > 0 && uploadProgress.video < 100 && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${uploadProgress.video}%` }}></div>
                        </div>
                        <span className="progress-text">{uploadProgress.video}%</span>
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowTeacherModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      {selectedTeacher ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Generate Modal */}
        {showGenerateModal && (
          <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
            <div className="modal-content modal-content-small" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Generate with {selectedTeacher?.aiTeacherName}</h2>
                <button className="modal-close" onClick={() => setShowGenerateModal(false)}>
                  <XCircle size={20} />
                </button>
              </div>

              <div className="generate-form">
                <form onSubmit={handleGenerateSubmit}>
                  <div className="form-group">
                    <label className="form-label">
                      <FileText size={16} />
                      Upload PDF <span className="required">*</span>
                    </label>
                    <div className="upload-area pdf-upload">
                      {pdfFile ? (
                        <div className="pdf-preview">
                          <FileText size={32} className="pdf-icon" />
                          <div className="pdf-info">
                            <span className="pdf-name">{pdfFile.name}</span>
                            <span className="pdf-size">{formatFileSize(pdfFile.size)}</span>
                          </div>
                          <button 
                            type="button" 
                            className="remove-upload"
                            onClick={() => setPdfFile(null)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-label">
                          <div className="upload-content">
                            <FileUp size={32} />
                            <span>Click to upload PDF</span>
                            <span className="upload-hint">PDF files only, max 50MB</span>
                          </div>
                          <input
                            type="file"
                            className="upload-input"
                            accept=".pdf"
                            onChange={handlePdfUpload}
                          />
                        </label>
                      )}
                    </div>
                    {uploadProgress.pdf > 0 && uploadProgress.pdf < 100 && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${uploadProgress.pdf}%` }}></div>
                        </div>
                        <span className="progress-text">{uploadProgress.pdf}% uploaded</span>
                      </div>
                    )}
                  </div>

                  <div className="generate-info">
                    <Sparkles size={16} className="info-icon" />
                    <span>The AI will analyze your PDF and generate relevant content</span>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowGenerateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn generate-btn" disabled={!pdfFile}>
                      <FileUp size={16} />
                      Generate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teachers;