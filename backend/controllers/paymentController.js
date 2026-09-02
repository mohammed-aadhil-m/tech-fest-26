const Payment = require('../models/Payment');
const EventRegistration = require('../models/EventRegistration');
const User = require('../models/User');
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
    const reg = await EventRegistration.findOne({ registrationId }).populate('user');
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    // Fetch all user's registrations to link them together
    const allUserRegs = await EventRegistration.find({ user: reg.user._id })
      .populate('event', 'name slug')
      .populate('team');
    const allRegIds = allUserRegs.map(r => r.registrationId);

    // Check for duplicate payment submission
    const existingPayment = await Payment.findOne({
      $or: [
        { registrationId: { $in: allRegIds } },
        { registrationIds: { $in: allRegIds } },
        { user: reg.user._id }
      ]
    });
    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Payment already submitted for this registration.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment screenshot is required.' });
    }

    const screenshotUrl = req.file.path;

    const payment = await Payment.create({
      registrationId,
      registrationIds: allRegIds,
      user: reg.user._id,
      transactionId: transactionId.trim(),
      paymentPhone: paymentPhone.trim(),
      screenshotUrl,
    });

    // Update all unpaid registrations for this user to pending
    await EventRegistration.updateMany(
      { user: reg.user._id, paymentStatus: 'unpaid' },
      { paymentStatus: 'pending', updatedAt: Date.now() }
    );
      
    const registeredEvents = allUserRegs.map(r => ({
      eventName: r.event?.name,
      eventSlug: r.event?.slug,
      isTeamRegistration: r.registrationType === 'TEAM',
      teamName: r.team?.teamName,
      teamLeader: r.team?.teamCode
    }));

    // Send confirmation email asynchronously
    sendRegistrationEmail(reg.user.email, reg.user.fullName, reg.registrationId, registeredEvents, reg.user.foodPreference);

    res.status(201).json({ success: true, data: payment });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, search, userId, registrationId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (userId || registrationId) {
      const matchConditions = [];

      if (userId) {
        matchConditions.push({ user: userId });
        const userRegs = await EventRegistration.find({ user: userId }).select('registrationId');
        const userRegIds = userRegs.map(r => r.registrationId).filter(Boolean);
        if (userRegIds.length > 0) {
          matchConditions.push({ registrationId: { $in: userRegIds } });
          matchConditions.push({ registrationIds: { $in: userRegIds } });
        }
      }

      if (registrationId) {
        const cleanRegId = registrationId.trim();
        const regRegex = new RegExp(`^${cleanRegId}$`, 'i');
        matchConditions.push({ registrationId: regRegex });
        matchConditions.push({ registrationIds: regRegex });

        const targetReg = await EventRegistration.findOne({ registrationId: regRegex }).populate('user');
        if (targetReg && targetReg.user) {
          const targetUserId = targetReg.user._id || targetReg.user;
          matchConditions.push({ user: targetUserId });
          const userRegs = await EventRegistration.find({ user: targetUserId }).select('registrationId');
          const userRegIds = userRegs.map(r => r.registrationId).filter(Boolean);
          if (userRegIds.length > 0) {
            matchConditions.push({ registrationId: { $in: userRegIds } });
            matchConditions.push({ registrationIds: { $in: userRegIds } });
          }
        }
      }

      filter.$or = matchConditions;
    } else if (search) {
      const cleanSearch = search.trim();
      const searchRegex = new RegExp(cleanSearch, 'i');
      const matchedUsers = await User.find({
        $or: [
          { fullName: searchRegex },
          { email: searchRegex },
          { mobile: searchRegex }
        ]
      }).select('_id');
      
      const matchedRegs = await EventRegistration.find({
        $or: [
          { registrationId: searchRegex },
          { user: { $in: matchedUsers.map(u => u._id) } }
        ]
      }).select('registrationId user');

      const regIds = matchedRegs.map(r => r.registrationId);
      const userIds = matchedRegs.map(r => r.user).filter(Boolean);

      filter.$or = [
        { registrationId: searchRegex },
        { registrationId: { $in: regIds } },
        { registrationIds: { $in: regIds } },
        { user: { $in: [...userIds, ...matchedUsers.map(u => u._id)] } },
        { transactionId: searchRegex },
        { paymentPhone: searchRegex },
      ];
    }

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate('user')
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

    const newPaymentStatus = payment.status === 'verified' ? 'paid' : (payment.status === 'rejected' ? 'rejected' : 'pending');

    // Sync paymentStatus to EventRegistrations for user or registration IDs
    let userQuery = null;
    if (payment.user) {
      userQuery = { user: payment.user };
    } else {
      const reg = await EventRegistration.findOne({ registrationId: payment.registrationId });
      if (reg) userQuery = { user: reg.user };
    }

    if (userQuery) {
      await EventRegistration.updateMany(
        userQuery,
        { paymentStatus: newPaymentStatus, updatedAt: Date.now() }
      );
    } else if (payment.registrationId) {
      await EventRegistration.updateMany(
        { registrationId: payment.registrationId },
        { paymentStatus: newPaymentStatus, updatedAt: Date.now() }
      );
    }

    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
};

