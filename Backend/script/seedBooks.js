const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const books = [
  {
    title: 'Introduction to Mathematics',
    author: 'Dr. Robert Johnson',
    isbn: '978-0-123456-78-1',
    category: 'Mathematics',
    description: 'Comprehensive guide to mathematics for high school students.',
    totalPages: 350,
    coverImage: '/uploads/covers/math-cover.jpg',
    pdfFile: '/uploads/books/math-textbook.pdf',
    publishedDate: '2023-01-15'
  },
  {
    title: 'Advanced Calculus',
    author: 'Prof. Sarah Williams',
    isbn: '978-0-123456-78-2',
    category: 'Mathematics',
    description: 'Advanced calculus concepts for college students.',
    totalPages: 450,
    coverImage: '/uploads/covers/calculus-cover.jpg',
    pdfFile: '/uploads/books/calculus.pdf',
    publishedDate: '2023-02-20'
  },
  {
    title: 'World History: Ancient Civilizations',
    author: 'Dr. Michael Chen',
    isbn: '978-0-123456-78-3',
    category: 'History',
    description: 'Explore ancient civilizations and their impact.',
    totalPages: 380,
    coverImage: '/uploads/covers/history-ancient.jpg',
    pdfFile: '/uploads/books/history-ancient.pdf',
    publishedDate: '2023-03-10'
  },
  {
    title: 'Modern World History',
    author: 'Prof. Emily Brown',
    isbn: '978-0-123456-78-4',
    category: 'History',
    description: 'From industrial revolution to present day.',
    totalPages: 420,
    coverImage: '/uploads/covers/history-modern.jpg',
    pdfFile: '/uploads/books/history-modern.pdf',
    publishedDate: '2023-04-05'
  },
  {
    title: 'Physics: Mechanics',
    author: 'Dr. James Wilson',
    isbn: '978-0-123456-78-5',
    category: 'Physics',
    description: 'Fundamentals of classical mechanics.',
    totalPages: 300,
    coverImage: '/uploads/covers/physics-mechanics.jpg',
    pdfFile: '/uploads/books/physics-mechanics.pdf',
    publishedDate: '2023-05-12'
  },
  {
    title: 'Quantum Physics Explained',
    author: 'Dr. Lisa Anderson',
    isbn: '978-0-123456-78-6',
    category: 'Physics',
    description: 'Introduction to quantum mechanics.',
    totalPages: 280,
    coverImage: '/uploads/covers/quantum-physics.jpg',
    pdfFile: '/uploads/books/quantum-physics.pdf',
    publishedDate: '2023-06-18'
  },
  {
    title: 'Organic Chemistry',
    author: 'Prof. Robert Martinez',
    isbn: '978-0-123456-78-7',
    category: 'Chemistry',
    description: 'Complete guide to organic chemistry.',
    totalPages: 500,
    coverImage: '/uploads/covers/organic-chemistry.jpg',
    pdfFile: '/uploads/books/organic-chemistry.pdf',
    publishedDate: '2023-07-22'
  },
  {
    title: 'Inorganic Chemistry',
    author: 'Dr. Patricia Lee',
    isbn: '978-0-123456-78-8',
    category: 'Chemistry',
    description: 'Principles of inorganic chemistry.',
    totalPages: 380,
    coverImage: '/uploads/covers/inorganic-chemistry.jpg',
    pdfFile: '/uploads/books/inorganic-chemistry.pdf',
    publishedDate: '2023-08-30'
  },
  {
    title: 'Biology: Cell Structure',
    author: 'Dr. David Thompson',
    isbn: '978-0-123456-78-9',
    category: 'Biology',
    description: 'Understanding cell biology.',
    totalPages: 320,
    coverImage: '/uploads/covers/cell-biology.jpg',
    pdfFile: '/uploads/books/cell-biology.pdf',
    publishedDate: '2023-09-14'
  },
  {
    title: 'Genetics Fundamentals',
    author: 'Prof. Maria Garcia',
    isbn: '978-0-123456-79-0',
    category: 'Biology',
    description: 'Introduction to genetics and heredity.',
    totalPages: 290,
    coverImage: '/uploads/covers/genetics.jpg',
    pdfFile: '/uploads/books/genetics.pdf',
    publishedDate: '2023-10-05'
  },
  {
    title: 'English Literature: Classics',
    author: 'Prof. William Shakespeare',
    isbn: '978-0-123456-79-1',
    category: 'Literature',
    description: 'Analysis of classic literary works.',
    totalPages: 400,
    coverImage: '/uploads/covers/english-classics.jpg',
    pdfFile: '/uploads/books/english-classics.pdf',
    publishedDate: '2023-11-11'
  },
  {
    title: 'Modern Poetry',
    author: 'Dr. Elizabeth Taylor',
    isbn: '978-0-123456-79-2',
    category: 'Literature',
    description: 'Contemporary poetry analysis.',
    totalPages: 250,
    coverImage: '/uploads/covers/modern-poetry.jpg',
    pdfFile: '/uploads/books/modern-poetry.pdf',
    publishedDate: '2023-12-01'
  },
  {
    title: 'Computer Science: Algorithms',
    author: 'Dr. Alan Turing',
    isbn: '978-0-123456-79-3',
    category: 'Computer Science',
    description: 'Essential algorithms and data structures.',
    totalPages: 450,
    coverImage: '/uploads/covers/algorithms.jpg',
    pdfFile: '/uploads/books/algorithms.pdf',
    publishedDate: '2024-01-08'
  },
  {
    title: 'Web Development Fundamentals',
    author: 'Prof. Grace Hopper',
    isbn: '978-0-123456-79-4',
    category: 'Computer Science',
    description: 'HTML, CSS, and JavaScript basics.',
    totalPages: 350,
    coverImage: '/uploads/covers/web-dev.jpg',
    pdfFile: '/uploads/books/web-dev.pdf',
    publishedDate: '2024-02-15'
  },
  // Continue with more books... (adding up to 50)
  // I'll add a few more samples here, but you can continue the pattern
  
  {
    title: 'Database Management Systems',
    author: 'Dr. Edgar Codd',
    isbn: '978-0-123456-79-5',
    category: 'Computer Science',
    description: 'SQL and database design principles.',
    totalPages: 380,
    coverImage: '/uploads/covers/database.jpg',
    pdfFile: '/uploads/books/database.pdf',
    publishedDate: '2024-03-20'
  },
  {
    title: 'Artificial Intelligence Basics',
    author: 'Prof. John McCarthy',
    isbn: '978-0-123456-79-6',
    category: 'Computer Science',
    description: 'Introduction to AI and machine learning.',
    totalPages: 320,
    coverImage: '/uploads/covers/ai-basics.jpg',
    pdfFile: '/uploads/books/ai-basics.pdf',
    publishedDate: '2024-04-12'
  },
  {
    title: 'Linear Algebra',
    author: 'Dr. Gilbert Strang',
    isbn: '978-0-123456-79-7',
    category: 'Mathematics',
    description: 'Comprehensive linear algebra textbook.',
    totalPages: 400,
    coverImage: '/uploads/covers/linear-algebra.jpg',
    pdfFile: '/uploads/books/linear-algebra.pdf',
    publishedDate: '2024-05-05'
  },
  {
    title: 'Differential Equations',
    author: 'Prof. Mary Cartwright',
    isbn: '978-0-123456-79-8',
    category: 'Mathematics',
    description: 'Solving differential equations.',
    totalPages: 360,
    coverImage: '/uploads/covers/differential-equations.jpg',
    pdfFile: '/uploads/books/differential-equations.pdf',
    publishedDate: '2024-06-18'
  },
  {
    title: 'Ancient Greek Philosophy',
    author: 'Dr. Socrates Plato',
    isbn: '978-0-123456-79-9',
    category: 'History',
    description: 'Philosophical thoughts of ancient Greece.',
    totalPages: 280,
    coverImage: '/uploads/covers/greek-philosophy.jpg',
    pdfFile: '/uploads/books/greek-philosophy.pdf',
    publishedDate: '2024-07-22'
  },
  {
    title: 'Roman Empire History',
    author: 'Prof. Marcus Aurelius',
    isbn: '978-0-123456-80-0',
    category: 'History',
    description: 'The rise and fall of Roman Empire.',
    totalPages: 420,
    coverImage: '/uploads/covers/roman-empire.jpg',
    pdfFile: '/uploads/books/roman-empire.pdf',
    publishedDate: '2024-08-30'
  }
  // Add more books to reach 50...
];

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookportal');
    
    // Get admin user (you need to create an admin first)
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('Please create an admin user first');
      process.exit(1);
    }

    // Add admin ID to each book
    const booksWithAdmin = books.map(book => ({
      ...book,
      addedBy: admin._id
    }));

    await Book.deleteMany({}); // Clear existing books
    await Book.insertMany(booksWithAdmin);

    console.log(`${books.length} books seeded successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exit(1);
  }
};

seedBooks();