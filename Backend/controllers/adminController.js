const Book = require('../models/Book');
const User = require('../models/User');
const UserBook = require('../models/UserBook');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    if (file.fieldname === 'coverImage') {
      uploadPath += 'covers/';
    } else if (file.fieldname === 'pdfFile') {
      uploadPath += 'books/';
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for cover'), false);
    }
  } else if (file.fieldname === 'pdfFile') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 }
]);

// @desc    Add new book
// @route   POST /api/admin/books
// @access  Private/Admin
const addBook = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { title, author, isbn, category, description, totalPages, publishedDate } = req.body;

      // Check if files are uploaded
      if (!req.files || !req.files.coverImage || !req.files.pdfFile) {
        return res.status(400).json({ message: 'Both cover image and PDF file are required' });
      }

      const coverImagePath = req.files.coverImage[0].path;
      const pdfFilePath = req.files.pdfFile[0].path;

      const book = await Book.create({
        title,
        author,
        isbn,
        category,
        description,
        totalPages: parseInt(totalPages),
        coverImage: coverImagePath,
        pdfFile: pdfFilePath,
        publishedDate: publishedDate || Date.now(),
        addedBy: req.user.id
      });

      res.status(201).json({
        success: true,
        book
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bulk add books (for initial 50 books)
// @route   POST /api/admin/books/bulk
// @access  Private/Admin
const bulkAddBooks = async (req, res) => {
  try {
    const books = req.body.books; // Array of book objects with temporary paths
    
    const createdBooks = [];
    for (const bookData of books) {
      const book = await Book.create({
        ...bookData,
        addedBy: req.user.id
      });
      createdBooks.push(book);
    }

    res.status(201).json({
      success: true,
      count: createdBooks.length,
      books: createdBooks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

    upload(req, res, async function(err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      // Update fields
      Object.assign(book, req.body);

      // Update files if provided
      if (req.files) {
        if (req.files.coverImage) {
          // Delete old cover
          if (book.coverImage && fs.existsSync(book.coverImage)) {
            fs.unlinkSync(book.coverImage);
          }
          book.coverImage = req.files.coverImage[0].path;
        }
        
        if (req.files.pdfFile) {
          // Delete old PDF
          if (book.pdfFile && fs.existsSync(book.pdfFile)) {
            fs.unlinkSync(book.pdfFile);
          }
          book.pdfFile = req.files.pdfFile[0].path;
        }
      }

      await book.save();
      res.json({ success: true, book });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
    if (book.coverImage && fs.existsSync(book.coverImage)) {
      fs.unlinkSync(book.coverImage);
    }
    if (book.pdfFile && fs.existsSync(book.pdfFile)) {
      fs.unlinkSync(book.pdfFile);
    }

    // Delete book and related data
    await book.deleteOne();
    await UserBook.deleteMany({ book: book._id });
    await Highlight.deleteMany({ book: book._id });

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user monthly limit
// @route   PUT /api/admin/users/:id/limit
// @access  Private/Admin
const updateUserLimit = async (req, res) => {
  try {
    const { monthlyBookLimit } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.monthlyBookLimit = monthlyBookLimit;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addBook,
  bulkAddBooks,
  updateBook,
  deleteBook,
  getUsers,
  updateUserLimit,
  upload
};