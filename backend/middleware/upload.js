const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage functions for each category
const createStorage = (folderName, allowedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `techfest26/${folderName}`,
      allowed_formats: allowedFormats,
      resource_type: folderName === 'papers' ? 'auto' : 'image',
      public_id: (req, file) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        return `${folderName}-${unique}`;
      },
    },
  });
};

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
  storage: createStorage('papers', ['pdf', 'doc', 'docx', 'jpg', 'png']),
  fileFilter: paperFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('paper');

exports.uploadGallery = multer({
  storage: createStorage('gallery'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('image');

exports.uploadWinnerPhoto = multer({
  storage: createStorage('winners'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('photo');

exports.uploadPaymentScreenshot = multer({
  storage: createStorage('payments'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('screenshot');
