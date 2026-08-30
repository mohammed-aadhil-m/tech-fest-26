const express = require('express');
const router = express.Router();
const { uploadPaymentScreenshot } = require('../middleware/upload');
const { createPayment } = require('../controllers/paymentController');

// POST /api/payments  (public - submit payment after registration)
router.post('/', (req, res, next) => {
  uploadPaymentScreenshot(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, createPayment);

module.exports = router;
