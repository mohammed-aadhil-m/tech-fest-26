const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
ensureDir(path.join(__dirname, '../uploads/papers'));
ensureDir(path.join(__dirname, '../uploads/gallery'));
ensureDir(path.join(__dirname, '../uploads/winners'));
ensureDir(path.join(__dirname, '../uploads/payments'));

// Storage for paper submissions
const paperStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/papers')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'paper-' + unique + path.extname(file.originalname));
  }
});

// Storage for gallery images
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/gallery')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'gallery-' + unique + path.extname(file.originalname));
  }
});

// Storage for winner photos
const winnerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/winners')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'winner-' + unique + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

const paperFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx/;
  const allowedMime = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowedMime.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed'), false);
  }
};

exports.uploadPaper = multer({
  storage: paperStorage,
  fileFilter: paperFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('paper');

exports.uploadGallery = multer({
  storage: galleryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('image');

exports.uploadWinnerPhoto = multer({
  storage: winnerStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('photo');

// Storage for payment screenshots
const paymentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/payments')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'payment-' + unique + path.extname(file.originalname));
  }
});

exports.uploadPaymentScreenshot = multer({
  storage: paymentStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('screenshot');
