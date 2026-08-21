const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const { sendRegistrationEmail } = require('../utils/emailSender');
const path = require('path');

// POST /api/payments  (public)
exports.createPayment = async (req, res, next) => {
  try {
    const { registrationId, transactionId, paymentPhone } = req.body;

    if (!registrationId || !transactionId || !paymentPhone) {
      return res.status(400).json({
        success: false,
        message: 'Registration ID, transaction ID, and payment phone are required.',
      });
    }

    // Verify registration exists
    const reg = await Registration.findOne({ registrationId });
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    // Check for duplicate payment submission
    const existingPayment = await Payment.findOne({ registrationId });
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Payment already submitted for this registration.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment screenshot is required.' });
    }

    const screenshotUrl = `/uploads/payments/${req.file.filename}`;

    const payment = await Payment.create({
      registrationId,
      transactionId: transactionId.trim(),
      paymentPhone: paymentPhone.trim(),
      screenshotUrl,
    });

    // Update registration paymentStatus to pending
    await Registration.findOneAndUpdate(
      { registrationId },
      { paymentStatus: 'pending', updatedAt: Date.now() }
    );

    // Send confirmation email asynchronously
    sendRegistrationEmail(reg.email, reg.fullName, reg.registrationId, reg.events, reg.foodPreference);

    res.status(201).json({ success: true, data: payment });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { registrationId: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { paymentPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: payments, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ADMIN: PUT /api/admin/payments/:id
exports.updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });

    // Sync paymentStatus to Registration
    await Registration.findOneAndUpdate(
      { registrationId: payment.registrationId },
      { paymentStatus: payment.status === 'verified' ? 'paid' : payment.status, updatedAt: Date.now() }
    );

    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
};
