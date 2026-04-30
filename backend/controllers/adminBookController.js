const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');
const { deleteFile } = require('../middleware/uploadMiddleware');

const addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, description, totalPages, publishedDate } = req.body;

    if (!req.files || !req.files.coverImage || !req.files.pdfFile) {
      return res.status(400).json({ message: 'Both cover image and PDF file are required', files: req.files });
    }

    const coverImagePath = '/uploads/covers/' + req.files.coverImage[0].filename;
    const pdfFilePath = '/uploads/books/' + req.files.pdfFile[0].filename;
    let book;

    await withDb(async (db) => {
      if (isbn && db.books.find(existing => existing.isbn === isbn)) {
        throw new Error('Book with this ISBN already exists');
      }

      book = makeRecord({
        title,
        author,
        isbn: isbn || '',
        category,
        description,
        totalPages: Number(totalPages) || 0,
        coverImage: coverImagePath,
        pdfFile: pdfFilePath,
        publishedDate: publishedDate || new Date().toISOString(),
        addedBy: req.user._id,
        isActive: true,
        totalReads: 0,
        averageRating: 0
      });
      db.books.push(book);
    });

    res.status(201).json({ success: true, message: 'Book added successfully', book });
  } catch (error) {
    if (req.files?.coverImage) deleteFile('/uploads/covers/' + req.files.coverImage[0].filename);
    if (req.files?.pdfFile) deleteFile('/uploads/books/' + req.files.pdfFile[0].filename);
    if (error.message === 'Book with this ISBN already exists') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Add book error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    let book;

    await withDb(async (db) => {
      book = db.books.find(item => item._id === req.params.id);
      if (!book) return;

      const patch = {
        ...(req.body.title && { title: req.body.title }),
        ...(req.body.author && { author: req.body.author }),
        ...(req.body.isbn && { isbn: req.body.isbn }),
        ...(req.body.category && { category: req.body.category }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.totalPages && { totalPages: Number(req.body.totalPages) || book.totalPages }),
        ...(req.body.publishedDate && { publishedDate: req.body.publishedDate }),
        ...(req.body.isActive !== undefined && { isActive: req.body.isActive === true || req.body.isActive === 'true' })
      };

      if (req.files?.coverImage) {
        deleteFile(book.coverImage);
        patch.coverImage = '/uploads/covers/' + req.files.coverImage[0].filename;
      }

      if (req.files?.pdfFile) {
        deleteFile(book.pdfFile);
        patch.pdfFile = '/uploads/books/' + req.files.pdfFile[0].filename;
      }

      book = Object.assign(book, touchRecord(book, patch));
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ success: true, message: 'Book updated successfully', book });
  } catch (error) {
    if (req.files?.coverImage) deleteFile('/uploads/covers/' + req.files.coverImage[0].filename);
    if (req.files?.pdfFile) deleteFile('/uploads/books/' + req.files.pdfFile[0].filename);
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    let book;

    await withDb(async (db) => {
      book = db.books.find(item => item._id === req.params.id);
      if (!book) return;

      deleteFile(book.coverImage);
      deleteFile(book.pdfFile);
      db.books = db.books.filter(item => item._id !== req.params.id);
      db.userBooks = db.userBooks.filter(item => item.book !== req.params.id);
      db.highlights = db.highlights.filter(item => item.book !== req.params.id);
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, search } = req.query;
    const db = await readDb();
    let books = [...db.books];

    if (category && category !== 'all') books = books.filter(book => book.category === category);
    if (status === 'active') books = books.filter(book => book.isActive !== false);
    if (status === 'inactive') books = books.filter(book => book.isActive === false);
    if (search) {
      const query = String(search).toLowerCase();
      books = books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        String(book.isbn || '').toLowerCase().includes(query)
      );
    }

    books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = books.length;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const pagedBooks = books.slice(skip, skip + parseInt(limit, 10));

    const booksWithStats = pagedBooks.map((book) => {
      const reads = db.userBooks.filter(item => item.book === book._id);
      const addedBy = db.users.find(user => user._id === book.addedBy);
      return {
        ...book,
        addedBy: addedBy ? { _id: addedBy._id, username: addedBy.username, email: addedBy.email } : null,
        totalReads: reads.length,
        uniqueReaders: new Set(reads.map(item => item.user)).size
      };
    });

    res.json({
      books: booksWithStats,
      pagination: {
        current: parseInt(page, 10),
        total: Math.ceil(total / parseInt(limit, 10)),
        totalItems: total,
        limit: parseInt(limit, 10)
      }
    });
  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const db = await readDb();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const totalBooks = db.books.length;
    const activeBooks = db.books.filter(book => book.isActive !== false).length;
    const totalUsers = db.users.filter(user => user.role === 'user').length;
    const totalReads = db.userBooks.length;
    const readsThisMonth = db.userBooks.filter(item => item.month === currentMonth).length;
    const activeReaders = new Set(
      db.userBooks
        .filter(item => new Date(item.lastReadAt || 0) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .map(item => item.user)
    ).size;

    const topBooks = Object.values(db.userBooks.reduce((acc, item) => {
      acc[item.book] ||= { _id: item.book, readCount: 0, uniqueReaders: new Set() };
      acc[item.book].readCount += 1;
      acc[item.book].uniqueReaders.add(item.user);
      return acc;
    }, {}))
      .sort((a, b) => b.readCount - a.readCount)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        uniqueReaders: Array.from(item.uniqueReaders),
        bookInfo: db.books.find(book => book._id === item._id) || null
      }));

    const categoryStats = Object.entries(db.books.reduce((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1;
      return acc;
    }, {}))
      .map(([category, count]) => ({ _id: category, count }))
      .sort((a, b) => b.count - a.count);

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
