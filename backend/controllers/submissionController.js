const Submission = require('../models/Submission');
const Team = require('../models/Team');
const User = require('../models/User');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { sendPaperSubmissionEmail } = require('../utils/emailSender');
const XLSX = require('xlsx');
const path = require('path');

// GET /api/submissions/verify/:regId (or /verify-eligibility)
exports.verifyEligibility = async (req, res, next) => {
  try {
    const rawId = (req.params.regId || req.query.id || req.body?.registrationId || '').trim();
    if (!rawId) {
      return res.status(400).json({
        success: false,
        eligible: false,
        message: 'Please provide your Registration ID.'
      });
    }

    const regIdRegex = new RegExp(`^${rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    // 1. Find the Paper Presentation event
    const paperEvent = await Event.findOne({ slug: 'paper-presentation' });
    if (!paperEvent) {
      return res.status(500).json({ success: false, message: 'Paper presentation event is not configured.' });
    }

    // 2. Find EventRegistration by registrationId
    let eventReg = await EventRegistration.findOne({ registrationId: regIdRegex })
      .populate('user')
      .populate({
        path: 'team',
        populate: { path: 'leader members', select: 'fullName email mobile college department year' }
      })
      .populate('event');

    let user = eventReg?.user;

    // If not found by registrationId directly, check if rawId is an email or mobile
    if (!eventReg) {
      const foundUser = await User.findOne({
        $or: [
          { email: rawId.toLowerCase() },
          { mobile: rawId }
        ]
      });

      if (foundUser) {
        user = foundUser;
        // Find paper presentation registration for this user
        eventReg = await EventRegistration.findOne({
          user: user._id,
          event: paperEvent._id,
          status: { $ne: 'cancelled' }
        })
          .populate('user')
          .populate({
            path: 'team',
            populate: { path: 'leader members', select: 'fullName email mobile college department year' }
          })
          .populate('event');
      }
    }

    // 3. Also check legacy Registration collection if still not found
    if (!eventReg && !user) {
      try {
        const Registration = require('../models/Registration');
        const legacyReg = await Registration.findOne({
          $or: [
            { registrationId: regIdRegex },
            { email: rawId.toLowerCase() },
            { mobile: rawId }
          ]
        });

        if (legacyReg) {
          const hasPaperEvent = legacyReg.events?.some(e => e.eventSlug === 'paper-presentation' || (e.eventName && e.eventName.toLowerCase().includes('paper')));
          if (!hasPaperEvent) {
            return res.status(200).json({
              success: true,
              eligible: false,
              reason: 'NOT_REGISTERED_FOR_EVENT',
              participantName: legacyReg.fullName,
              registeredEvents: legacyReg.events?.map(e => e.eventName).filter(Boolean) || [],
              message: `You are registered for TECH FEST '26 (ID: ${legacyReg.registrationId}), but you have NOT registered for the Paper Presentation event. Only participants registered for Paper Presentation can submit a paper.`
            });
          }

          // Check if paper already submitted
          const existingSub = await Submission.findOne({
            $or: [
              { email: legacyReg.email.toLowerCase() },
              { registrationId: legacyReg.registrationId.toUpperCase() }
            ]
          });

          if (existingSub) {
            return res.json({
              success: true,
              eligible: true,
              alreadySubmitted: true,
              submission: existingSub,
              message: `A paper titled "${existingSub.paperTitle}" has already been submitted for this registration.`
            });
          }

          return res.json({
            success: true,
            eligible: true,
            alreadySubmitted: false,
            registrationId: legacyReg.registrationId,
            participant: {
              name: legacyReg.fullName,
              email: legacyReg.email,
              mobile: legacyReg.mobile,
              college: legacyReg.college,
              department: legacyReg.department,
              year: legacyReg.year
            },
            team: null
          });
        }
      } catch (err) {
        // legacy ignore
      }
    }

    // If user is found, check if they are registered for Paper Presentation
    if (user && !eventReg) {
      // Find all events this user registered for
      const allUserRegs = await EventRegistration.find({ user: user._id, status: { $ne: 'cancelled' } }).populate('event');
      const registeredEventNames = allUserRegs.map(r => r.event?.name).filter(Boolean);
      const isRegisteredForPaper = allUserRegs.some(r => r.event?.slug === 'paper-presentation' || r.event?._id?.toString() === paperEvent._id.toString());

      if (!isRegisteredForPaper) {
        return res.status(200).json({
          success: true,
          eligible: false,
          reason: 'NOT_REGISTERED_FOR_EVENT',
          participantName: user.fullName,
          registeredEvents: registeredEventNames,
          message: `Hello ${user.fullName}, you are registered for TECH FEST '26 (${registeredEventNames.join(', ')}), but you have NOT registered for the Paper Presentation event. Only participants registered for Paper Presentation can submit a paper.`
        });
      }

      eventReg = allUserRegs.find(r => r.event?.slug === 'paper-presentation' || r.event?._id?.toString() === paperEvent._id.toString());
    }

    if (!eventReg) {
      return res.status(404).json({
        success: false,
        eligible: false,
        reason: 'REGISTRATION_NOT_FOUND',
        message: `Registration ID "${rawId}" was not found. Please verify your Registration ID or register for the event first.`
      });
    }

    // Check if the event registration is for paper presentation
    const isPaperEvent = eventReg.event?.slug === 'paper-presentation' || eventReg.event?._id?.toString() === paperEvent._id.toString();
    if (!isPaperEvent) {
      // Find all other event registrations for this user
      const otherRegs = await EventRegistration.find({ user: eventReg.user._id, status: { $ne: 'cancelled' } }).populate('event');
      const paperReg = otherRegs.find(r => r.event?.slug === 'paper-presentation' || r.event?._id?.toString() === paperEvent._id.toString());

      if (!paperReg) {
        const registeredEventNames = otherRegs.map(r => r.event?.name).filter(Boolean);
        return res.status(200).json({
          success: true,
          eligible: false,
          reason: 'NOT_REGISTERED_FOR_EVENT',
          participantName: eventReg.user?.fullName,
          registeredEvents: registeredEventNames,
          message: `Registration ID ${rawId} belongs to ${eventReg.user?.fullName} for "${eventReg.event?.name}", but you have NOT registered for the Paper Presentation event. Only participants registered for Paper Presentation can submit a paper.`
        });
      }

      eventReg = paperReg;
    }

    // If we have verified paper registration:
    const team = eventReg.team;
    const participantUser = eventReg.user;

    // Check if a paper has already been submitted for this user / team
    const checkEmails = [participantUser.email.toLowerCase()];
    if (team) {
      if (team.leader?.email) checkEmails.push(team.leader.email.toLowerCase());
      if (Array.isArray(team.members)) {
        team.members.forEach(m => {
          if (m.email) checkEmails.push(m.email.toLowerCase());
        });
      }
    }

    const queryOr = [
      { email: { $in: checkEmails } },
      { registrationId: eventReg.registrationId.toUpperCase() }
    ];
    if (team?.teamCode) {
      queryOr.push({ teamCode: team.teamCode.toUpperCase() });
    }

    const existingSubmission = await Submission.findOne({ $or: queryOr });

    if (existingSubmission) {
      return res.json({
        success: true,
        eligible: true,
        alreadySubmitted: true,
        canUpdate: true,
        registrationId: eventReg.registrationId,
        submission: existingSubmission,
        participant: {
          name: participantUser.fullName,
          email: participantUser.email,
          mobile: participantUser.mobile,
          college: participantUser.college,
          department: participantUser.department,
          year: participantUser.year
        },
        team: team ? {
          teamName: team.teamName,
          teamCode: team.teamCode,
          leader: team.leader ? { name: team.leader.fullName, email: team.leader.email } : null,
          members: Array.isArray(team.members) ? team.members.map(m => ({ name: m.fullName, email: m.email })) : []
        } : null,
        message: `A paper titled "${existingSubmission.paperTitle}" has already been submitted for this registration. You may update your paper presentation details or re-upload slides before the deadline (04/09/2026).`
      });
    }

    return res.json({
      success: true,
      eligible: true,
      alreadySubmitted: false,
      registrationId: eventReg.registrationId,
      participant: {
        name: participantUser.fullName,
        email: participantUser.email,
        mobile: participantUser.mobile,
        college: participantUser.college,
        department: participantUser.department,
        year: participantUser.year
      },
      team: team ? {
        teamName: team.teamName,
        teamCode: team.teamCode,
        leader: team.leader ? { name: team.leader.fullName, email: team.leader.email } : null,
        members: Array.isArray(team.members) ? team.members.map(m => ({ name: m.fullName, email: m.email })) : []
      } : null
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/submissions
exports.createSubmission = async (req, res, next) => {
  try {
    const {
      submissionId,
      isUpdate,
      registrationId,
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

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedTeamCode = teamCode ? teamCode.trim().toUpperCase() : null;
    const normalizedTeamName = teamName ? teamName.trim() : null;
    const normalizedRegId = registrationId ? registrationId.trim().toUpperCase() : null;

    // ── Check if this is an UPDATE request ─────────────────
    if (isUpdate === true || isUpdate === 'true' || submissionId) {
      let existingSub = null;
      if (submissionId) {
        existingSub = await Submission.findById(submissionId);
      }
      if (!existingSub && normalizedRegId) {
        existingSub = await Submission.findOne({ registrationId: normalizedRegId });
      }
      if (!existingSub && normalizedEmail) {
        existingSub = await Submission.findOne({ email: normalizedEmail });
      }

      if (existingSub) {
        existingSub.paperTitle = finalTitle.trim();
        existingSub.topic = finalTitle.trim();
        existingSub.abstract = abstract.trim();
        if (driveUrl !== undefined) existingSub.driveUrl = driveUrl.trim();
        if (mobile) existingSub.mobile = mobile.trim();
        if (department) existingSub.department = department.trim();
        if (year) existingSub.year = year;
        if (normalizedTeamName) existingSub.teamName = normalizedTeamName;
        if (normalizedTeamCode) existingSub.teamCode = normalizedTeamCode;
        if (normalizedRegId) existingSub.registrationId = normalizedRegId;

        if (req.file) {
          existingSub.fileUrl = `/uploads/papers/${req.file.filename}`;
          existingSub.fileName = req.file.originalname;
        }

        existingSub.submittedAt = Date.now();
        await existingSub.save();

        sendPaperSubmissionEmail(existingSub).catch(err => console.error('Email error:', err));

        return res.status(200).json({
          success: true,
          message: 'Paper submission updated successfully! A confirmation email has been sent.',
          data: existingSub,
          updated: true
        });
      }
    }

    // ── Otherwise: CREATE FLOW (Check for duplicates) ──────
    // 1. Check if email or regId already submitted
    const existingByEmailOrReg = await Submission.findOne({
      $or: [
        { email: normalizedEmail },
        ...(normalizedRegId ? [{ registrationId: normalizedRegId }] : [])
      ]
    });
    if (existingByEmailOrReg) {
      return res.status(400).json({
        success: false,
        alreadySubmitted: true,
        submissionId: existingByEmailOrReg._id,
        message: `A paper titled "${existingByEmailOrReg.paperTitle}" has already been submitted (${normalizedEmail}). You can choose to update your existing paper before the deadline.`
      });
    }

    // 2. Check if team code already submitted
    if (normalizedTeamCode) {
      const existingByTeamCode = await Submission.findOne({ teamCode: normalizedTeamCode });
      if (existingByTeamCode) {
        return res.status(400).json({
          success: false,
          alreadySubmitted: true,
          submissionId: existingByTeamCode._id,
          message: `A paper titled "${existingByTeamCode.paperTitle}" has already been submitted for Team Code "${normalizedTeamCode}". You can update the submission before the deadline.`
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
            alreadySubmitted: true,
            submissionId: existingByTeamMember._id,
            message: `A team member (${existingByTeamMember.name}) from team "${registeredTeam.teamName}" has already submitted a paper titled "${existingByTeamMember.paperTitle}". You can update the submission before the deadline.`
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
          alreadySubmitted: true,
          submissionId: existingByTeamName._id,
          message: `A paper titled "${existingByTeamName.paperTitle}" has already been submitted for team "${normalizedTeamName}". You can update the submission before the deadline.`
        });
      }
    }

    const submissionData = {
      registrationId: normalizedRegId || '',
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
