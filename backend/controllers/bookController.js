const { readDb, withDb, makeRecord, monthKey, toNumber } = require('../lib/localStore');

const getProgressPercentage = (pagesRead, totalPages) => {
  if (!totalPages) return 0;
  return Math.round((pagesRead / totalPages) * 100);
};

const withBookUrls = (req, book) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return {
    ...book,
    pdfUrl: book.pdfFile ? `${baseUrl}${book.pdfFile}` : '',
    coverUrl: book.coverImage ? `${baseUrl}${book.coverImage}` : ''
  };
};

const getUserBookEntry = (db, userId, bookId, month) =>
  db.userBooks.find(entry => entry.user === userId && entry.book === bookId && entry.month === month);

const getUserTotals = (db, userId) => {
  const userBooks = db.userBooks.filter(entry => entry.user === userId);
  const totalPagesRead = userBooks.reduce((sum, entry) => sum + (toNumber(entry.pagesRead)), 0);
  return { userBooks, totalPagesRead };
};

const getCurrentMonthBookCount = (db, userId, currentMonth) =>
  db.userBooks.filter(entry => entry.user === userId && entry.month === currentMonth).length;

const getBookView = (book, progress) => ({
  ...book,
  pagesRead: progress?.pagesRead || 0,
  currentPage: progress?.currentPage || 0,
  lastRead: progress?.lastReadAt || null,
  progress: getProgressPercentage(progress?.pagesRead || 0, book.totalPages)
});

const getBooks = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const db = await readDb();
    const currentMonth = monthKey();
    let books = db.books.filter(book => book.isActive !== false);

    if (category && category !== 'all') {
      books = books.filter(book => book.category === category);
    }

    if (search) {
      const query = String(search).toLowerCase();
      books = books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
      );
    }

    books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = books.length;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    books = books.slice(skip, skip + parseInt(limit, 10));

    const booksWithProgress = books.map(book => {
      const userBook = getUserBookEntry(db, req.user._id, book._id, currentMonth);
      return getBookView(book, userBook);
    });

    res.json({
      success: true,
      data: {
        books: booksWithProgress,
        pagination: {
          current: parseInt(page, 10),
          total: Math.ceil(total / parseInt(limit, 10)),
          totalItems: total,
          limit: parseInt(limit, 10)
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBookById = async (req, res) => {
  try {
    const currentMonth = monthKey();
    let responseData;

    await withDb(async (db) => {
      const book = db.books.find(item => item._id === req.params.id);
      if (!book) throw new Error('Book not found');
      if (book.isActive === false) throw new Error('This book is currently unavailable');

      const booksThisMonth = getCurrentMonthBookCount(db, req.user._id, currentMonth);
      let userBook = getUserBookEntry(db, req.user._id, book._id, currentMonth);
      const isNewAccess = !userBook;

      if (isNewAccess) {
        if (booksThisMonth >= req.user.monthlyBookLimit) {
          const limitError = new Error('Monthly book limit reached');
          limitError.type = 'limit';
          limitError.limit = req.user.monthlyBookLimit;
          limitError.current = booksThisMonth;
          throw limitError;
        }

        userBook = makeRecord({
          user: req.user._id,
          book: book._id,
          month: currentMonth,
          currentPage: 0,
          pagesRead: 0,
          isCompleted: false,
          lastReadAt: new Date().toISOString(),
          firstOpenedAt: new Date().toISOString(),
          readingSession: 0
        });
        db.userBooks.push(userBook);

        const user = db.users.find(item => item._id === req.user._id);
        if (user) {
          user.booksReadThisMonth = booksThisMonth + 1;
          user.updatedAt = new Date().toISOString();
        }

        book.totalReads = (book.totalReads || 0) + 1;
        book.updatedAt = new Date().toISOString();
      }

      const highlights = db.highlights
        .filter(item => item.user === req.user._id && item.book === book._id)
        .sort((a, b) => a.page - b.page);

      responseData = {
        ...withBookUrls(req, book),
        currentPage: userBook.currentPage,
        pagesRead: userBook.pagesRead,
        isCompleted: userBook.isCompleted,
        highlights,
        isNew: isNewAccess,
        remainingBooks: req.user.monthlyBookLimit - booksThisMonth - (isNewAccess ? 1 : 0)
      };
    });

    res.json({ success: true, data: responseData });
  } catch (error) {
    if (error.type === 'limit') {
      return res.status(403).json({ message: error.message, limit: error.limit, current: error.current });
    }
    if (error.message === 'Book not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'This book is currently unavailable') {
      return res.status(403).json({ message: error.message });
    }
    console.error('Get book by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProgress = async (req, res) => {
  try {
    const currentMonth = monthKey();
    let payload;

    await withDb(async (db) => {
      const userBook = getUserBookEntry(db, req.user._id, req.params.id, currentMonth);
      if (!userBook) throw new Error('Book access not found');

      const book = db.books.find(item => item._id === req.params.id);
      if (!book) throw new Error('Book not found');

      const currentPage = Math.max(0, toNumber(req.body.currentPage, userBook.currentPage));
      const pagesRead = Math.max(currentPage, toNumber(req.body.pagesRead, currentPage));

      userBook.currentPage = currentPage;
      userBook.pagesRead = Math.min(pagesRead, book.totalPages);
      userBook.lastReadAt = new Date().toISOString();
      userBook.readingSession = (userBook.readingSession || 0) + 1;
      userBook.updatedAt = new Date().toISOString();
      userBook.isCompleted = userBook.pagesRead >= book.totalPages;

      const user = db.users.find(item => item._id === req.user._id);
      if (!user) throw new Error('User not found');

      const previousLastRead = user.lastReadDate;
      const { totalPagesRead } = getUserTotals(db, req.user._id);
      user.totalPagesRead = totalPagesRead;
      user.lastReadDate = new Date().toISOString();

      const today = new Date();
      const diffDays = previousLastRead
        ? Math.floor((today - new Date(previousLastRead)) / (1000 * 60 * 60 * 24))
        : 999;

      if (diffDays <= 1) {
        user.readingStreak = (user.readingStreak || 0) + 1;
      } else {
        user.readingStreak = 1;
      }
      user.updatedAt = new Date().toISOString();

      payload = {
        success: true,
        progress: {
          currentPage: userBook.currentPage,
          pagesRead: userBook.pagesRead,
          isCompleted: userBook.isCompleted,
          progress: getProgressPercentage(userBook.pagesRead, book.totalPages)
        },
        userStats: {
          totalPagesRead: user.totalPagesRead,
          readingStreak: user.readingStreak
        }
      };
    });

    res.json(payload);
  } catch (error) {
    if (error.message === 'Book access not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addHighlight = async (req, res) => {
  try {
    const { page, text, color, note } = req.body;
    let highlight;

    await withDb(async (db) => {
      highlight = makeRecord({
        user: req.user._id,
        book: req.params.id,
        page: toNumber(page, 1),
        text: String(text || '').trim(),
        color: color || '#fef3c7',
        note: note || ''
      });
      db.highlights.push(highlight);
    });

    res.status(201).json({ success: true, data: highlight });
  } catch (error) {
    console.error('Add highlight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteHighlight = async (req, res) => {
  try {
    let removed = false;
    await withDb(async (db) => {
      const before = db.highlights.length;
      db.highlights = db.highlights.filter(item => !(item._id === req.params.id && item.user === req.user._id));
      removed = db.highlights.length !== before;
    });

    if (!removed) {
      return res.status(404).json({ message: 'Highlight not found' });
    }

    res.json({ success: true, message: 'Highlight deleted' });
  } catch (error) {
    console.error('Delete highlight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const db = await readDb();
    const currentMonth = monthKey();
    const booksThisMonth = getCurrentMonthBookCount(db, req.user._id, currentMonth);
    const allUserBooks = db.userBooks.filter(item => item.user === req.user._id);
    const totalPagesRead = allUserBooks.reduce((sum, item) => sum + (item.pagesRead || 0), 0);
    const completedBooks = allUserBooks.filter(item => item.isCompleted).length;
    const booksInProgress = allUserBooks.filter(item => !item.isCompleted && item.pagesRead > 0).length;

    const averageCompletion = allUserBooks.length > 0
      ? Math.round(allUserBooks.reduce((sum, item) => {
        const book = db.books.find(candidate => candidate._id === item.book);
        return sum + ((item.pagesRead || 0) / (book?.totalPages || 1));
      }, 0) / allUserBooks.length * 100)
      : 0;

    const readingHistory = Object.values(allUserBooks.reduce((acc, item) => {
      acc[item.month] ||= { _id: item.month, booksRead: 0, pagesRead: 0, completedBooks: 0 };
      acc[item.month].booksRead += 1;
      acc[item.month].pagesRead += item.pagesRead || 0;
      acc[item.month].completedBooks += item.isCompleted ? 1 : 0;
      return acc;
    }, {}))
      .sort((a, b) => b._id.localeCompare(a._id))
      .slice(0, 6);

    const recentlyRead = allUserBooks
      .sort((a, b) => new Date(b.lastReadAt || 0) - new Date(a.lastReadAt || 0))
      .slice(0, 5)
      .map((item) => ({
        ...item,
        book: db.books.find(book => book._id === item.book) || null
      }));

    const user = db.users.find(item => item._id === req.user._id) || req.user;

    res.json({
      success: true,
      data: {
        booksReadThisMonth: booksThisMonth,
        totalBooksLimit: user.monthlyBookLimit,
        totalPagesRead,
        completedBooks,
        booksInProgress,
        averageCompletion,
        readingStreak: user.readingStreak || 0,
        remainingBooks: Math.max(0, user.monthlyBookLimit - booksThisMonth),
        readingHistory,
        recentlyRead
      }
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
