const Submission = require('../models/Submission');
const path = require('path');

// POST /api/submissions
exports.createSubmission = async (req, res, next) => {
  try {
    const { name, email, mobile, college, department, year, paperTitle, abstract } = req.body;
    if (!name || !email || !college || !paperTitle || !abstract) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    // Check deadline
    const deadline = new Date('2026-09-04');
    if (new Date() > deadline) {
      return res.status(400).json({ success: false, message: 'Submission deadline has passed (04/09/2026).' });
    }

    const submissionData = { name, email, mobile, college, department, year, paperTitle, abstract };

    if (req.file) {
      submissionData.fileUrl = `/uploads/papers/${req.file.filename}`;
      submissionData.fileName = req.file.originalname;
    }

    const submission = await Submission.create(submissionData);
    res.status(201).json({ success: true, data: submission });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/submissions
exports.getAllSubmissions = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { paperTitle: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter).sort({ submittedAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, data: submissions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/submissions/:id
exports.getSubmission = async (req, res, next) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
};

// ADMIN: PUT /api/admin/submissions/:id
exports.updateSubmission = async (req, res, next) => {
  try {
    const sub = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
};

// ADMIN: DELETE /api/admin/submissions/:id
exports.deleteSubmission = async (req, res, next) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Submission deleted.' });
  } catch (err) { next(err); }
};
