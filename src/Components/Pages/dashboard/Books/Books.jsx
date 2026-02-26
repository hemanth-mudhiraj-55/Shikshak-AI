import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Clock,
  Eye,
  BookMarked,
  TrendingUp,
  Award,
  ChevronRight,
  X,
  Highlighter,
  FileText,
  Calendar,
  BookCopy,
  AlertCircle
} from 'lucide-react';
import './Books.css';

const Books = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [readBooks, setReadBooks] = useState({});

  const categories = ['All', 'Mathematics', 'Science', 'History', 'Literature', 'Computer Science'];

  const books = [
    {
      id: 1,
      title: 'Introduction to Mathematics',
      author: 'Dr. Robert Johnson',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'Mathematics',
      totalPages: 350,
      pagesRead: 120,
      lastRead: '2024-03-15',
      isAvailable: true,
      description: 'Comprehensive guide to mathematics for high school students.',
      pdfUrl: '/books/math-textbook.pdf',
      readLimit: 10,
      timesReadThisMonth: 3
    },
    {
      id: 2,
      title: 'World History: Modern Era',
      author: 'Prof. Sarah Williams',
      cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'History',
      totalPages: 420,
      pagesRead: 0,
      lastRead: null,
      isAvailable: true,
      description: 'Detailed exploration of modern world history.',
      pdfUrl: '/books/history-textbook.pdf',
      readLimit: 10,
      timesReadThisMonth: 1
    },
    {
      id: 3,
      title: 'Physics for Beginners',
      author: 'Dr. Michael Chen',
      cover: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'Science',
      totalPages: 280,
      pagesRead: 45,
      lastRead: '2024-03-14',
      isAvailable: true,
      description: 'Easy-to-understand physics concepts with practical examples.',
      pdfUrl: '/books/physics-textbook.pdf',
      readLimit: 10,
      timesReadThisMonth: 5
    },
    {
      id: 4,
      title: 'English Literature Anthology',
      author: 'Prof. Emily Brown',
      cover: 'https://images.unsplash.com/photo-1495640452828-3df6795cf69b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'Literature',
      totalPages: 520,
      pagesRead: 0,
      lastRead: null,
      isAvailable: true,
      description: 'Collection of classic and contemporary literary works.',
      pdfUrl: '/books/literature-anthology.pdf',
      readLimit: 10,
      timesReadThisMonth: 0
    },
    {
      id: 5,
      title: 'Chemistry Lab Manual',
      author: 'Dr. James Wilson',
      cover: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'Science',
      totalPages: 200,
      pagesRead: 200,
      lastRead: '2024-03-10',
      isAvailable: true,
      description: 'Practical laboratory experiments and safety guidelines.',
      pdfUrl: '/books/chemistry-manual.pdf',
      readLimit: 10,
      timesReadThisMonth: 2
    },
    {
      id: 6,
      title: 'Computer Science Fundamentals',
      author: 'Dr. Lisa Anderson',
      cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      category: 'Computer Science',
      totalPages: 380,
      pagesRead: 90,
      lastRead: '2024-03-16',
      isAvailable: true,
      description: 'Complete introduction to programming and computer science.',
      pdfUrl: '/books/cs-fundamentals.pdf',
      readLimit: 10,
      timesReadThisMonth: 4
    }
  ];

  // Mock data for student's reading stats
  const studentStats = {
    booksReadThisMonth: 8,
    totalBooksLimit: 10,
    totalPagesRead: 455,
    averageCompletion: 65,
    streak: 7
  };

  const getFilteredBooks = () => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => 
        book.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return filtered;
  };

  const openBook = (book) => {
    setSelectedBook(book);
    setCurrentPage(1);
    setHighlightMode(false);
  };

  const closeBook = () => {
    setSelectedBook(null);
    setHighlightMode(false);
  };

  const nextPage = () => {
    if (selectedBook && currentPage < selectedBook.totalPages) {
      setCurrentPage(currentPage + 1);
      // Track pages read
      if (currentPage + 1 > (readBooks[selectedBook.id] || 0)) {
        setReadBooks({
          ...readBooks,
          [selectedBook.id]: currentPage + 1
        });
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleHighlight = () => {
    setHighlightMode(!highlightMode);
  };

  const addHighlight = () => {
    if (highlightMode && selectedBook) {
      const selection = window.getSelection();
      const selectedText = selection.toString();
      
      if (selectedText) {
        const bookHighlights = highlights[selectedBook.id] || [];
        const newHighlight = {
          id: Date.now(),
          text: selectedText,
          page: currentPage,
          color: '#fef3c7',
          timestamp: new Date().toISOString()
        };
        
        setHighlights({
          ...highlights,
          [selectedBook.id]: [...bookHighlights, newHighlight]
        });
        
        selection.removeAllRanges();
      }
    }
  };

  const getProgressPercentage = (pagesRead, totalPages) => {
    return Math.round((pagesRead / totalPages) * 100);
  };

  const getRemainingBooks = () => {
    return studentStats.totalBooksLimit - studentStats.booksReadThisMonth;
  };

  const filteredBooks = getFilteredBooks();

  return (
    <div className="books-container">
      {/* Header with Student Stats */}
      <div className="books-header">
        <h2 className="books-title">My Books Portal</h2>
        <div className="student-stats">
          <div className="stat-pill">
            <BookCopy size={18} />
            <span>{studentStats.booksReadThisMonth}/{studentStats.totalBooksLimit} Books</span>
          </div>
          <div className="stat-pill">
            <FileText size={18} />
            <span>{studentStats.totalPagesRead} Pages</span>
          </div>
          <div className="stat-pill">
            <TrendingUp size={18} />
            <span>{studentStats.averageCompletion}% Avg</span>
          </div>
          <div className="stat-pill">
            <Award size={18} />
            <span>{studentStats.streak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Monthly Limit Alert */}
      {getRemainingBooks() <= 3 && getRemainingBooks() > 0 && (
        <div className="limit-alert warning">
          <AlertCircle size={20} />
          <span>You have {getRemainingBooks()} book{getRemainingBooks() > 1 ? 's' : ''} remaining this month</span>
        </div>
      )}
      
      {getRemainingBooks() === 0 && (
        <div className="limit-alert danger">
          <AlertCircle size={20} />
          <span>You've reached your monthly limit of 10 books. New books will be available next month.</span>
        </div>
      )}

      {/* Search and Filter */}
      <div className="search-section">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search books by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          className="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category.toLowerCase()}>{category}</option>
          ))}
        </select>
      </div>

      {/* Books Grid */}
      <div className="books-grid">
        {filteredBooks.map(book => {
          const progress = getProgressPercentage(book.pagesRead, book.totalPages);
          const isBookAvailable = studentStats.booksReadThisMonth < studentStats.totalBooksLimit;
          
          return (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                <img src={book.cover} alt={book.title} />
                {progress > 0 && (
                  <div className="progress-overlay">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
              
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <p className="book-category">{book.category}</p>
                
                <div className="book-progress">
                  <div className="progress-text">
                    <span>{book.pagesRead}/{book.totalPages} pages</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {book.lastRead && (
                  <div className="last-read">
                    <Clock size={14} />
                    <span>Last read {new Date(book.lastRead).toLocaleDateString()}</span>
                  </div>
                )}

                <button
                  className={`read-button ${!isBookAvailable && book.pagesRead === 0 ? 'disabled' : ''}`}
                  onClick={() => openBook(book)}
                  disabled={!isBookAvailable && book.pagesRead === 0}
                >
                  <Eye size={18} />
                  {book.pagesRead > 0 ? 'Continue Reading' : 'Read Now'}
                </button>

                {!isBookAvailable && book.pagesRead === 0 && (
                  <p className="limit-message">Monthly limit reached</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="empty-state">
          <BookOpen size={48} />
          <p>No books found</p>
        </div>
      )}

      {/* PDF Reader Modal */}
      {selectedBook && (
        <div className="reader-modal">
          <div className="reader-container">
            <div className="reader-header">
              <div className="reader-title">
                <h3>{selectedBook.title}</h3>
                <p>{selectedBook.author}</p>
              </div>
              <div className="reader-controls">
                <button 
                  className={`highlight-btn ${highlightMode ? 'active' : ''}`}
                  onClick={toggleHighlight}
                  title="Highlight text"
                >
                  <Highlighter size={20} />
                </button>
                <button className="close-btn" onClick={closeBook}>
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="reader-content" onMouseUp={addHighlight}>
              <div className="pdf-viewer">
                {/* Mock PDF Content */}
                <div className="pdf-page">
                  <h2>Page {currentPage}</h2>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  
                  {/* Display highlights for current page */}
                  {highlights[selectedBook.id]?.filter(h => h.page === currentPage).map(highlight => (
                    <div key={highlight.id} className="highlight" style={{ backgroundColor: highlight.color }}>
                      {highlight.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="reader-footer">
              <div className="page-controls">
                <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {selectedBook.totalPages}</span>
                <button onClick={nextPage} disabled={currentPage === selectedBook.totalPages}>Next</button>
              </div>
              <div className="reading-progress">
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(currentPage / selectedBook.totalPages) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;