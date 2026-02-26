const Book = require('../models/Book');
const UserBook = require('../models/UserBook');
const Highlight = require('../models/Highlight');
const User = require('../models/User');

// @desc    Get all available books
// @route   GET /api/books
// @access  Private
const getBooks = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const books = await Book.find(query)
      .select('-pdfFile')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Book.countDocuments(query);
    
    // Get user's reading progress for each book
    const currentMonth = new Date().toISOString().slice(0, 7);
    const userBooks = await UserBook.find({
      user: req.user._id,
      month: currentMonth
    });

    const booksWithProgress = books.map(book => {
      const userBook = userBooks.find(ub => ub.book.toString() === book._id.toString());
      return {
        ...book.toObject(),
        pagesRead: userBook ? userBook.pagesRead : 0,
        currentPage: userBook ? userBook.currentPage : 0,
        lastRead: userBook ? userBook.lastReadAt : null,
        progress: userBook ? Math.round((userBook.pagesRead / book.totalPages) * 100) : 0
      };
    });

    res.json({
      books: booksWithProgress,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single book with PDF access
// @route   GET /api/books/:id
// @access  Private
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!book.isActive) {
      return res.status(403).json({ message: 'This book is currently unavailable' });
    }

    // Check monthly limit
    const currentMonth = new Date().toISOString().slice(0, 7);
    const booksThisMonth = await UserBook.countDocuments({
      user: req.user._id,
      month: currentMonth
    });

    // Check if user already has access to this book
    let userBook = await UserBook.findOne({
      user: req.user._id,
      book: book._id,
      month: currentMonth
    });

    const isNewAccess = !userBook;

    // If new access, check limit and create record
    if (isNewAccess) {
      if (booksThisMonth >= req.user.monthlyBookLimit) {
        return res.status(403).json({ 
          message: 'Monthly book limit reached',
          limit: req.user.monthlyBookLimit,
          current: booksThisMonth
        });
      }

      userBook = await UserBook.create({
        user: req.user._id,
        book: book._id,
        month: currentMonth
      });

      // Update user's monthly count
      await User.findByIdAndUpdate(req.user._id, {
        booksReadThisMonth: booksThisMonth + 1
      });
    }

    // Get user's highlights for this book
    const highlights = await Highlight.find({
      user: req.user._id,
      book: book._id
    }).sort('page');

    // Get server URL for file access
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.json({
      ...book.toObject(),
      pdfUrl: `${baseUrl}${book.pdfFile}`,
      coverUrl: `${baseUrl}${book.coverImage}`,
      currentPage: userBook.currentPage,
      pagesRead: userBook.pagesRead,
      isCompleted: userBook.isCompleted,
      highlights,
      isNew: isNewAccess,
      remainingBooks: req.user.monthlyBookLimit - booksThisMonth - (isNewAccess ? 1 : 0)
    });
  } catch (error) {
    console.error('Get book by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update reading progress
// @route   PUT /api/books/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { currentPage, pagesRead } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const userBook = await UserBook.findOne({
      user: req.user._id,
      book: req.params.id,
      month: currentMonth
    });

    if (!userBook) {
      return res.status(404).json({ message: 'Book access not found' });
    }

    const book = await Book.findById(req.params.id);
    
    userBook.currentPage = currentPage;
    userBook.pagesRead = pagesRead;
    userBook.lastReadAt = Date.now();
    userBook.readingSession += 1;

    if (pagesRead >= book.totalPages) {
      userBook.isCompleted = true;
    }

    await userBook.save();

    // Update user's total pages read and streak
    const allUserBooks = await UserBook.find({ user: req.user._id });
    const totalPagesRead = allUserBooks.reduce((sum, ub) => sum + ub.pagesRead, 0);
    
    const user = await User.findById(req.user._id);
    user.totalPagesRead = totalPagesRead;
    user.lastReadDate = Date.now();
    
    // Update reading streak
    const lastRead = user.lastReadDate;
    const today = new Date();
    const diffDays = Math.floor((today - lastRead) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      user.readingStreak += 1;
    } else if (diffDays > 1) {
      user.readingStreak = 1;
    }
    
    await user.save();

    res.json({ 
      success: true,
      progress: {
        currentPage: userBook.currentPage,
        pagesRead: userBook.pagesRead,
        isCompleted: userBook.isCompleted,
        progress: Math.round((userBook.pagesRead / book.totalPages) * 100)
      },
      userStats: {
        totalPagesRead: user.totalPagesRead,
        readingStreak: user.readingStreak
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add highlight to book
// @route   POST /api/books/:id/highlights
// @access  Private
const addHighlight = async (req, res) => {
  try {
    const { page, text, color, note } = req.body;

    const highlight = await Highlight.create({
      user: req.user._id,
      book: req.params.id,
      page,
      text,
      color: color || '#fef3c7',
      note: note || ''
    });

    res.status(201).json(highlight);
  } catch (error) {
    console.error('Add highlight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete highlight
// @route   DELETE /api/books/highlights/:id
// @access  Private
const deleteHighlight = async (req, res) => {
  try {
    const highlight = await Highlight.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!highlight) {
      return res.status(404).json({ message: 'Highlight not found' });
    }

    await highlight.deleteOne();
    res.json({ success: true, message: 'Highlight deleted' });
  } catch (error) {
    console.error('Delete highlight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's reading stats
// @route   GET /api/books/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const booksThisMonth = await UserBook.countDocuments({
      user: req.user._id,
      month: currentMonth
    });

    const allUserBooks = await UserBook.find({ user: req.user._id })
      .populate('book', 'totalPages title');
    
    const totalPagesRead = allUserBooks.reduce((sum, ub) => sum + ub.pagesRead, 0);
    const completedBooks = allUserBooks.filter(ub => ub.isCompleted).length;
    
    const booksInProgress = allUserBooks.filter(ub => !ub.isCompleted && ub.pagesRead > 0).length;
    
    const averageCompletion = allUserBooks.length > 0 
      ? Math.round((allUserBooks.reduce((sum, ub) => sum + (ub.pagesRead / ub.book.totalPages), 0) / allUserBooks.length) * 100)
      : 0;

    // Get reading history by month (last 6 months)
    const readingHistory = await UserBook.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
          _id: '$month',
          booksRead: { $sum: 1 },
          pagesRead: { $sum: '$pagesRead' },
          completedBooks: { $sum: { $cond: ['$isCompleted', 1, 0] } }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 6 }
    ]);

    // Get recently read books
    const recentlyRead = await UserBook.find({ user: req.user._id })
      .populate('book', 'title author coverImage totalPages category')
      .sort('-lastReadAt')
      .limit(5);

    res.json({
      booksReadThisMonth: booksThisMonth,
      totalBooksLimit: req.user.monthlyBookLimit,
      totalPagesRead,
      completedBooks,
      booksInProgress,
      averageCompletion,
      readingStreak: req.user.readingStreak,
      remainingBooks: Math.max(0, req.user.monthlyBookLimit - booksThisMonth),
      readingHistory,
      recentlyRead
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBooks,
  getBookById,
  updateProgress,
  addHighlight,
  deleteHighlight,
  getUserStats
};