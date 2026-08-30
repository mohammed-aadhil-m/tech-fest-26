const Submission = require('../models/Submission');
const Team = require('../models/Team');
const User = require('../models/User');
const { sendPaperSubmissionEmail } = require('../utils/emailSender');
const XLSX = require('xlsx');
const path = require('path');

// POST /api/submissions
exports.createSubmission = async (req, res, next) => {
  try {
    const {
      name, email, mobile, college, department, year,
      paperTitle, topic, abstract, teamName, teamCode, driveUrl
    } = req.body;

    const finalTitle = paperTitle || topic;

    if (!name || !email || !college || !finalTitle || !abstract) {
      return res.status(400).json({
        success: false,
        message: 'Author Name, Email, College, Paper Topic/Title, and Abstract are required.'
      });
    }

    // Check deadline
    const deadline = new Date('2026-09-04T23:59:59');
    if (new Date() > deadline) {
      return res.status(400).json({
        success: false,
        message: 'Submission deadline has passed (04/09/2026).'
      });
    }

    // Check duplicate submissions: "more than one paper from same team is not allowed"
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedTeamCode = teamCode ? teamCode.trim().toUpperCase() : null;
    const normalizedTeamName = teamName ? teamName.trim() : null;

    // 1. Check if email already submitted
    const existingByEmail = await Submission.findOne({ email: normalizedEmail });
    if (existingByEmail) {
      return res.status(400).json({
        success: false,
        message: `A paper titled "${existingByEmail.paperTitle}" has already been submitted using this email (${normalizedEmail}). Only one paper submission per participant/team is allowed.`
      });
    }

    // 2. Check if team code already submitted
    if (normalizedTeamCode) {
      const existingByTeamCode = await Submission.findOne({ teamCode: normalizedTeamCode });
      if (existingByTeamCode) {
        return res.status(400).json({
          success: false,
          message: `A paper titled "${existingByTeamCode.paperTitle}" has already been submitted for Team Code "${normalizedTeamCode}" by ${existingByTeamCode.name}. Only one paper submission per team is allowed.`
        });
      }

      // Check if any member of this registered team has submitted
      const registeredTeam = await Team.findOne({ teamCode: normalizedTeamCode }).populate('members').populate('leader');
      if (registeredTeam) {
        const memberEmails = [
          registeredTeam.leader?.email,
          ...(registeredTeam.members || []).map(m => m.email)
        ].filter(Boolean).map(e => e.toLowerCase());

        const existingByTeamMember = await Submission.findOne({ email: { $in: memberEmails } });
        if (existingByTeamMember) {
          return res.status(400).json({
            success: false,
            message: `A team member (${existingByTeamMember.name}) from team "${registeredTeam.teamName}" has already submitted a paper titled "${existingByTeamMember.paperTitle}". Only one paper submission per team is allowed.`
          });
        }
      }
    }

    // 3. Check if team name already submitted
    if (normalizedTeamName) {
      const existingByTeamName = await Submission.findOne({
        teamName: { $regex: new RegExp(`^${normalizedTeamName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (existingByTeamName) {
        return res.status(400).json({
          success: false,
          message: `A paper titled "${existingByTeamName.paperTitle}" has already been submitted for team "${normalizedTeamName}" by ${existingByTeamName.name}. Only one paper submission per team is allowed.`
        });
      }
    }

    const submissionData = {
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile ? mobile.trim() : '',
      college: college.trim(),
      department: department ? department.trim() : '',
      year: year || '',
      topic: finalTitle.trim(),
      paperTitle: finalTitle.trim(),
      abstract: abstract.trim(),
      teamName: normalizedTeamName || '',
      teamCode: normalizedTeamCode || '',
      driveUrl: driveUrl ? driveUrl.trim() : ''
    };

    if (req.file) {
      submissionData.fileUrl = `/uploads/papers/${req.file.filename}`;
      submissionData.fileName = req.file.originalname;
    }

    const submission = await Submission.create(submissionData);

    // Send confirmation email asynchronously
    sendPaperSubmissionEmail(submission).catch(err => console.error('Email error:', err));

    res.status(201).json({
      success: true,
      message: 'Paper submitted successfully! A confirmation email has been sent.',
      data: submission
    });
  } catch (err) {
    next(err);
  }
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
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { paperTitle: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { teamName: { $regex: search, $options: 'i' } },
        { teamCode: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: submissions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// ADMIN: GET /api/admin/submissions/:id
exports.getSubmission = async (req, res, next) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });
    res.json({ success: true, data: sub });
  } catch (err) {
    next(err);
  }
};

// ADMIN: PUT /api/admin/submissions/:id
exports.updateSubmission = async (req, res, next) => {
  try {
    const sub = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });
    res.json({ success: true, data: sub });
  } catch (err) {
    next(err);
  }
};

// ADMIN: DELETE /api/admin/submissions/:id
exports.deleteSubmission = async (req, res, next) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Submission deleted.' });
  } catch (err) {
    next(err);
  }
};

// ADMIN: GET /api/admin/submissions/export/excel
exports.exportExcel = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { paperTitle: { $regex: search, $options: 'i' } },
        { teamName: { $regex: search, $options: 'i' } },
        { teamCode: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }
    const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const data = submissions.map((s, idx) => {
      let fileLink = s.fileUrl || '';
      if (fileLink && !fileLink.startsWith('http')) {
        fileLink = `${baseUrl.replace(/\/$/, '')}${fileLink.startsWith('/') ? '' : '/'}${fileLink}`;
      }
      return {
        'S.No': idx + 1,
        'Paper Topic / Title': s.paperTitle || s.topic || '',
        'Team Name': s.teamName || 'Individual',
        'Team Code': s.teamCode || '',
        'Author Name': s.name || '',
        'Email Address': s.email || '',
        'Mobile Number': s.mobile || '',
        'College': s.college || '',
        'Department': s.department || '',
        'Year': s.year || '',
        'Abstract': s.abstract || '',
        'Google Drive Link': s.driveUrl || '',
        'Uploaded Document Link': fileLink,
        'Status': (s.status || 'pending').toUpperCase(),
        'Submitted At': s.submittedAt ? new Date(s.submittedAt).toLocaleString('en-IN') : ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 6 },   // S.No
      { wch: 32 },  // Paper Topic / Title
      { wch: 20 },  // Team Name
      { wch: 14 },  // Team Code
      { wch: 22 },  // Author Name
      { wch: 28 },  // Email Address
      { wch: 15 },  // Mobile Number
      { wch: 32 },  // College
      { wch: 20 },  // Department
      { wch: 12 },  // Year
      { wch: 45 },  // Abstract
      { wch: 40 },  // Google Drive Link
      { wch: 40 },  // Uploaded Document Link
      { wch: 14 },  // Status
      { wch: 22 }   // Submitted At
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paper Submissions');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="techfest26-paper-submissions.xlsx"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// ADMIN: GET /api/admin/submissions/export/csv
exports.exportCSV = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { paperTitle: { $regex: search, $options: 'i' } },
        { teamName: { $regex: search, $options: 'i' } },
        { teamCode: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }
    const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const headers = [
      'Paper Topic / Title', 'Team Name', 'Team Code', 'Author Name', 'Email',
      'Mobile', 'College', 'Department', 'Year', 'Abstract', 'Google Drive Link',
      'File URL', 'Status', 'Submitted Date'
    ];
    const rows = submissions.map(s => {
      let fileLink = s.fileUrl || '';
      if (fileLink && !fileLink.startsWith('http')) {
        fileLink = `${baseUrl.replace(/\/$/, '')}${fileLink.startsWith('/') ? '' : '/'}${fileLink}`;
      }
      return [
        s.paperTitle || s.topic || '',
        s.teamName || 'Individual',
        s.teamCode || '',
        s.name,
        s.email,
        s.mobile,
        s.college,
        s.department,
        s.year,
        s.abstract,
        s.driveUrl || '',
        fileLink,
        (s.status || 'pending').toUpperCase(),
        new Date(s.submittedAt).toLocaleString('en-IN')
      ].map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="techfest26-paper-submissions.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
