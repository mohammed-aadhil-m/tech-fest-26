const express = require('express');
const router = express.Router();
const { createSubmission } = require('../controllers/submissionController');
const { uploadPaper } = require('../middleware/upload');

router.post('/', (req, res, next) => {
  uploadPaper(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, createSubmission);

module.exports = router;
