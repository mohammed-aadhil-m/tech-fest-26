const express = require('express');
const router = express.Router();
const { createSubmission, verifyEligibility } = require('../controllers/submissionController');
const { uploadPaper } = require('../middleware/upload');

// Verify registration eligibility for Paper Presentation
router.get('/verify/:regId', verifyEligibility);
router.post('/verify', verifyEligibility);

router.post('/', (req, res, next) => {
  uploadPaper(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, createSubmission);

module.exports = router;
