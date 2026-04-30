import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
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
  const [books, setBooks] = useState([]);
  const [bookStats, setBookStats] = useState(null);
  const [loadingBooks, setLoadingBooks] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [booksRes, statsRes] = await Promise.all([
          api.get('/books'),
          api.get('/books/stats')
        ]);
        if (booksRes.success) setBooks(booksRes.data.data || booksRes.data.books || []);
        if (statsRes.success) setBookStats(statsRes.data.data || statsRes.data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, []);

  const categories = ['All', 'Mathematics', 'Science', 'History', 'Literature', 'Computer Science'];

  const displayStats = bookStats || {
    booksReadThisMonth: 0,
    totalBooksLimit: 10,
    totalPagesRead: 0,
    averageCompletion: 0,
    streak: 0
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

  const openBook = async (book) => {
    setSelectedBook(book);
    setCurrentPage(1);
    setHighlightMode(false);

    // Load highlights for this book
    try {
      const bookId = book._id || book.id;
      const response = await api.get(`/books/${bookId}`);
      if (response.success && response.data?.data?.highlights) {
        setHighlights(prev => ({
          ...prev,
          [bookId]: response.data.data.highlights
        }));
      }
    } catch (error) {
      console.error('Failed to load highlights:', error);
    }
  };

  const closeBook = () => {
    setSelectedBook(null);
    setHighlightMode(false);
  };

  const nextPage = async () => {
    if (selectedBook && currentPage < selectedBook.totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);

      const bookId = selectedBook._id || selectedBook.id;
      if (newPage > (readBooks[bookId] || 0)) {
        setReadBooks({ ...readBooks, [bookId]: newPage });
        // Save progress to backend
        try {
          await api.put(`/books/${bookId}/progress`, { currentPage: newPage });
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
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

  const addHighlight = async () => {
    if (highlightMode && selectedBook) {
      const selection = window.getSelection();
      const selectedText = selection.toString();

      if (selectedText) {
        try {
          const bookId = selectedBook._id || selectedBook.id;
          const response = await api.post(`/books/${bookId}/highlights`, {
            text: selectedText,
            page: currentPage,
            color: '#fef3c7'
          });
          if (response.success) {
            const newHighlight = response.data.data || response.data;
            const bookHighlights = highlights[bookId] || [];
            setHighlights({
              ...highlights,
              [bookId]: [...bookHighlights, newHighlight]
            });
          }
        } catch (error) {
          console.error('Failed to save highlight:', error);
        }
        selection.removeAllRanges();
      }
    }
  };

  const getProgressPercentage = (pagesRead, totalPages) => {
    return Math.round((pagesRead / totalPages) * 100);
  };

  const getRemainingBooks = () => {
    return displayStats.totalBooksLimit - displayStats.booksReadThisMonth;
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
            <span>{displayStats.booksReadThisMonth}/{displayStats.totalBooksLimit} Books</span>
          </div>
          <div className="stat-pill">
            <FileText size={18} />
            <span>{displayStats.totalPagesRead} Pages</span>
          </div>
          <div className="stat-pill">
            <TrendingUp size={18} />
            <span>{displayStats.averageCompletion}% Avg</span>
          </div>
          <div className="stat-pill">
            <Award size={18} />
            <span>{displayStats.streak} Day Streak</span>
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
          const isBookAvailable = displayStats.booksReadThisMonth < displayStats.totalBooksLimit;
          
          return (
            <div key={book._id || book.id} className="book-card">
              <div className="book-cover">
                <img src={book.coverImage || book.cover} alt={book.title} />
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
                  {highlights[selectedBook._id || selectedBook.id]?.filter(h => h.page === currentPage).map(highlight => (
                    <div key={highlight._id || highlight.id} className="highlight" style={{ backgroundColor: highlight.color }}>
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