const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../uploads/books'),
    path.join(__dirname, '../uploads/covers')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '../uploads');
    
    if (file.fieldname === 'coverImage') {
      uploadPath = path.join(uploadPath, 'covers');
    } else if (file.fieldname === 'pdfFile') {
      uploadPath = path.join(uploadPath, 'books');
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const sanitizedName = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, sanitizedName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/jpg,image/webp').split(',');
  const allowedPdfTypes = (process.env.ALLOWED_PDF_TYPES || 'application/pdf').split(',');
  
  if (file.fieldname === 'coverImage') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed for cover'), false);
    }
  } else if (file.fieldname === 'pdfFile') {
    if (allowedPdfTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
  }
});

// Middleware for handling book uploads
const uploadBookFiles = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 }
]);

// Helper to delete file
const deleteFile = (filePath) => {
  if (!filePath) return false;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
};

module.exports = {
  uploadBookFiles,
  deleteFile
};