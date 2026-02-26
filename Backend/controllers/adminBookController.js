const Book = require('../models/Book');
const User = require('../models/User');
const UserBook = require('../models/UserBook');
const Highlight = require('../models/Highlight');
const { deleteFile } = require('../middleware/uploadMiddleware');

// @desc    Add new book
// @route   POST /api/admin/books
// @access  Private/Admin
const addBook = async (req, res) => {
  try {
    console.log('Received add book request');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const { title, author, isbn, category, description, totalPages, publishedDate } = req.body;

    // Check if files are uploaded
    if (!req.files || !req.files.coverImage || !req.files.pdfFile) {
      return res.status(400).json({ 
        message: 'Both cover image and PDF file are required',
        files: req.files 
      });
    }

    // Check if book with same ISBN exists
    if (isbn) {
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        // Clean up uploaded files
        if (req.files.coverImage) deleteFile('/uploads/covers/' + req.files.coverImage[0].filename);
        if (req.files.pdfFile) deleteFile('/uploads/books/' + req.files.pdfFile[0].filename);
        return res.status(400).json({ message: 'Book with this ISBN already exists' });
      }
    }

    // Get relative paths for storage in database
    const coverImagePath = '/uploads/covers/' + req.files.coverImage[0].filename;
    const pdfFilePath = '/uploads/books/' + req.files.pdfFile[0].filename;

    const book = await Book.create({
      title,
      author,
      isbn: isbn || undefined,
      category,
      description,
      totalPages: parseInt(totalPages),
      coverImage: coverImagePath,
      pdfFile: pdfFilePath,
      publishedDate: publishedDate || Date.now(),
      addedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    console.error('Add book error:', error);
    // Clean up uploaded files on error
    if (req.files) {
      if (req.files.coverImage) {
        deleteFile('/uploads/covers/' + req.files.coverImage[0].filename);
      }
      if (req.files.pdfFile) {
        deleteFile('/uploads/books/' + req.files.pdfFile[0].filename);
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update book
// @route   PUT /api/admin/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update text fields
    const { title, author, isbn, category, description, totalPages, publishedDate, isActive } = req.body;
    
    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    if (category) book.category = category;
    if (description) book.description = description;
    if (totalPages) book.totalPages = parseInt(totalPages);
    if (publishedDate) book.publishedDate = publishedDate;
    if (isActive !== undefined) book.isActive = isActive;

    // Update files if provided
    if (req.files) {
      if (req.files.coverImage) {
        // Delete old cover
        deleteFile(book.coverImage);
        book.coverImage = '/uploads/covers/' + req.files.coverImage[0].filename;
      }
      
      if (req.files.pdfFile) {
        // Delete old PDF
        deleteFile(book.pdfFile);
        book.pdfFile = '/uploads/books/' + req.files.pdfFile[0].filename;
      }
    }

    await book.save();
    
    res.json({ 
      success: true, 
      message: 'Book updated successfully',
      book 
    });
  } catch (error) {
    console.error('Update book error:', error);
    // Clean up newly uploaded files on error
    if (req.files) {
      if (req.files.coverImage) {
        deleteFile('/uploads/covers/' + req.files.coverImage[0].filename);
      }
      if (req.files.pdfFile) {
        deleteFile('/uploads/books/' + req.files.pdfFile[0].filename);
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete book
// @route   DELETE /api/admin/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Delete associated files
    deleteFile(book.coverImage);
    deleteFile(book.pdfFile);

    // Delete book and related data
    await book.deleteOne();
    await UserBook.deleteMany({ book: book._id });
    await Highlight.deleteMany({ book: book._id });

    res.json({ 
      success: true, 
      message: 'Book deleted successfully' 
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all books (admin view)
// @route   GET /api/admin/books
// @access  Private/Admin
const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const books = await Book.find(query)
      .populate('addedBy', 'username email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Book.countDocuments(query);

    // Get read counts for each book
    const bookIds = books.map(b => b._id);
    const readCounts = await UserBook.aggregate([
      { $match: { book: { $in: bookIds } } },
      { $group: {
          _id: '$book',
          totalReads: { $sum: 1 },
          uniqueReaders: { $addToSet: '$user' }
        }
      }
    ]);

    const booksWithStats = books.map(book => {
      const stats = readCounts.find(r => r._id && r._id.equals(book._id)) || {};
      return {
        ...book.toObject(),
        totalReads: stats.totalReads || 0,
        uniqueReaders: stats.uniqueReaders ? stats.uniqueReaders.length : 0
      };
    });

    res.json({
      books: booksWithStats,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get dashboard stats for admin
// @route   GET /api/admin/books/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const activeBooks = await Book.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalReads = await UserBook.countDocuments();
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const readsThisMonth = await UserBook.countDocuments({ month: currentMonth });
    
    const activeReaders = await UserBook.distinct('user', { 
      lastReadAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).then(users => users.length);

    // Top books
    const topBooks = await UserBook.aggregate([
      { $group: {
          _id: '$book',
          readCount: { $sum: 1 },
          uniqueReaders: { $addToSet: '$user' }
        }
      },
      { $sort: { readCount: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookInfo'
        }
      },
      { $unwind: '$bookInfo' }
    ]);

    // Category distribution
    const categoryStats = await Book.aggregate([
      { $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: {
        totalBooks,
        activeBooks,
        totalUsers,
        totalReads,
        readsThisMonth,
        activeReaders
      },
      topBooks,
      categoryStats
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addBook,
  updateBook,
  deleteBook,
  getAllBooks,
  getAdminStats
};