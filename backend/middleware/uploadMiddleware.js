const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../uploads/books'),
    path.join(__dirname, '../uploads/covers'),
    path.join(__dirname, '../uploads/avatars'),
    path.join(__dirname, '../uploads/teachers/photos'),
    path.join(__dirname, '../uploads/teachers/videos'),
    path.join(__dirname, '../uploads/teachers/pdfs'),
    path.join(__dirname, '../uploads/teachers/generated')
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
    } else if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadPath, 'avatars');
    } else if (file.fieldname === 'teacherPhoto') {
      uploadPath = path.join(uploadPath, 'teachers', 'photos');
    } else if (file.fieldname === 'teacherVideo') {
      uploadPath = path.join(uploadPath, 'teachers', 'videos');
    } else if (file.fieldname === 'teacherPdf') {
      uploadPath = path.join(uploadPath, 'teachers', 'pdfs');
    } else if (file.fieldname === 'generatedAvatar') {
      uploadPath = path.join(uploadPath, 'teachers', 'generated');
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
  const allowedVideoTypes = (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm,video/quicktime').split(',');
  
  if (file.fieldname === 'coverImage' || file.fieldname === 'avatar') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'), false);
    }
  } else if (file.fieldname === 'teacherPhoto') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for teacher photo'), false);
    }
  } else if (file.fieldname === 'teacherVideo') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (mp4/webm/mov) are allowed for teacher video'), false);
    }
  } else if (file.fieldname === 'generatedAvatar') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (mp4/webm/mov) are allowed for generated avatar'), false);
    }
  } else if (file.fieldname === 'teacherPdf') {
    if (allowedPdfTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for teacher session upload'), false);
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

// Middleware for handling avatar upload
const uploadAvatar = upload.single('avatar');

// Middleware for handling teacher model uploads
const uploadTeacherAssets = upload.fields([
  { name: 'teacherPhoto', maxCount: 1 },
  { name: 'teacherVideo', maxCount: 1 }
]);

const uploadTeacherSessionPdf = upload.single('teacherPdf');

const uploadGeneratedAvatar = upload.single('generatedAvatar');

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
  uploadAvatar,
  uploadTeacherAssets,
  uploadTeacherSessionPdf,
  uploadGeneratedAvatar,
  deleteFile
};
