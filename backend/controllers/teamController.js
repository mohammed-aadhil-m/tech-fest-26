const Team = require('../models/Team');
const Event = require('../models/Event');
const User = require('../models/User');
const EventRegistration = require('../models/EventRegistration');
const Payment = require('../models/Payment');
const XLSX = require('xlsx');

// GET /api/teams/verify/:teamCode (public)
exports.verifyTeamCode = async (req, res, next) => {
  try {
    const { teamCode } = req.params;
    const { eventSlug } = req.query; // Ensure the team is for the correct event

    const team = await Team.findOne({ teamCode: teamCode.toUpperCase() })
      .populate('leader', 'fullName email')
      .populate('members', 'fullName email')
      .populate('event', 'name slug isTeamEvent maxTeamSize');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Invalid Team Code. Team not found.' });
    }

    if (eventSlug && team.event.slug !== eventSlug) {
      return res.status(400).json({ success: false, message: `This team code is for a different event (${team.event.name}).` });
    }

    if (team.members.length >= team.event.maxTeamSize) {
      return res.status(400).json({ success: false, message: 'This team has already reached its maximum capacity.' });
    }

    res.json({
      success: true,
      data: {
        teamName: team.teamName,
        teamCode: team.teamCode,
        eventName: team.event.name,
        leader: team.leader.fullName,
        memberCount: team.members.length,
        maxSize: team.event.maxTeamSize,
        members: team.members.map(m => m.fullName)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Helper to enrich teams with member registrations & payment status
const enrichTeamsWithRegistrations = async (teams) => {
  const teamIds = teams.map(t => t._id);
  const memberIds = teams.flatMap(t => (t.members || []).map(m => m._id || m));

  // Find all registrations associated with these teams or members
  const registrations = await EventRegistration.find({
    $or: [
      { team: { $in: teamIds } },
      { user: { $in: memberIds } }
    ]
  }).populate('user');

  // Map by `${teamId}_${userId}` and `${eventId}_${userId}`
  const regMap = new Map();
  registrations.forEach(r => {
    const uId = r.user?._id ? r.user._id.toString() : r.user?.toString();
    const tId = r.team ? r.team.toString() : '';
    const eId = r.event ? r.event.toString() : '';
    if (tId && uId) regMap.set(`${tId}_${uId}`, r);
    if (eId && uId) regMap.set(`${eId}_${uId}`, r);
    if (uId) regMap.set(uId, r);
  });

  return teams.map(t => {
    const tObj = t.toObject ? t.toObject() : { ...t };
    const eId = t.event?._id ? t.event._id.toString() : (t.event ? t.event.toString() : '');
    const tId = t._id.toString();

    // Enrich each member with their registration ID and status
    tObj.members = (tObj.members || []).map(m => {
      const mId = m._id ? m._id.toString() : m.toString();
      const reg = regMap.get(`${tId}_${mId}`) || regMap.get(`${eId}_${mId}`) || regMap.get(mId);
      return {
        ...m,
        registrationId: reg?.registrationId || 'N/A',
        regStatus: reg?.status || 'registered',
        paymentStatus: reg?.paymentStatus || 'unpaid',
        registeredAt: reg?.createdAt || tObj.createdAt
      };
    });

    // Leader info
    const lId = tObj.leader?._id ? tObj.leader._id.toString() : tObj.leader?.toString();
    const leaderReg = regMap.get(`${tId}_${lId}`) || regMap.get(`${eId}_${lId}`) || regMap.get(lId);
    if (tObj.leader && typeof tObj.leader === 'object') {
      tObj.leader.registrationId = leaderReg?.registrationId || 'N/A';
      tObj.leader.paymentStatus = leaderReg?.paymentStatus || 'unpaid';
    }

    return tObj;
  });
};

// ADMIN: GET /api/admin/teams
exports.getAllTeams = async (req, res, next) => {
  try {
    const { search, event, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (event) {
      const ev = await Event.findOne({ $or: [{ slug: event }, { _id: event.match(/^[0-9a-fA-F]{24}$/) ? event : null }] });
      if (ev) filter.event = ev._id;
    }

    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { college: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = users.map(u => u._id);

      filter.$or = [
        { teamName: { $regex: search, $options: 'i' } },
        { teamCode: { $regex: search, $options: 'i' } },
        { leader: { $in: userIds } },
        { members: { $in: userIds } }
      ];
    }

    const total = await Team.countDocuments(filter);
    const teams = await Team.find(filter)
      .populate('event', 'name slug icon category maxTeamSize minTeamSize isTeamEvent')
      .populate('leader', 'fullName email mobile college department year foodPreference')
      .populate('members', 'fullName email mobile college department year foodPreference')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const enrichedTeams = await enrichTeamsWithRegistrations(teams);

    res.json({
      success: true,
      data: enrichedTeams,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// ADMIN: GET /api/admin/teams/:id
exports.getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('event')
      .populate('leader')
      .populate('members');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    const [enrichedTeam] = await enrichTeamsWithRegistrations([team]);
    res.json({ success: true, data: enrichedTeam });
  } catch (err) {
    next(err);
  }
};

// ADMIN: DELETE /api/admin/teams/:id
exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    // Unlink team from EventRegistrations
    await EventRegistration.updateMany({ team: req.params.id }, { $set: { team: null } });

    res.json({ success: true, message: 'Team deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ADMIN: GET /api/admin/teams/export/excel
exports.exportTeamsExcel = async (req, res, next) => {
  try {
    const { search, event } = req.query;
    const filter = {};

    if (event) {
      const ev = await Event.findOne({ $or: [{ slug: event }, { _id: event.match(/^[0-9a-fA-F]{24}$/) ? event : null }] });
      if (ev) filter.event = ev._id;
    }

    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { college: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      filter.$or = [
        { teamName: { $regex: search, $options: 'i' } },
        { teamCode: { $regex: search, $options: 'i' } },
        { leader: { $in: users.map(u => u._id) } },
        { members: { $in: users.map(u => u._id) } }
      ];
    }

    const teams = await Team.find(filter)
      .populate('event')
      .populate('leader')
      .populate('members')
      .sort({ createdAt: -1 });

    const enrichedTeams = await enrichTeamsWithRegistrations(teams);

    const data = [];
    let sNo = 1;

    enrichedTeams.forEach(t => {
      const e = t.event || {};
      const l = t.leader || {};
      const members = t.members || [];

      // Add a summary row or multi-member rows
      const memberNames = members.map(m => m.fullName).join(', ');
      const memberDetails = members.map(m => `${m.fullName} (${m.registrationId || 'N/A'} - ${m.paymentStatus || 'unpaid'})`).join(' | ');

      const rawCat = e.category || 'technical';
      const eventCategory = rawCat.toLowerCase() === 'non-technical' ? 'Non-Technical' : 'Technical';

      data.push({
        'S.No': sNo++,
        'Team Name': t.teamName,
        'Team Code': t.teamCode,
        'Event Name': e.name || 'N/A',
        'Event Category': eventCategory,
        'Members Count': `${members.length} / ${e.maxTeamSize || members.length}`,
        'Team Leader': l.fullName || '',
        'Leader Email': l.email || '',
        'Leader Mobile': l.mobile || '',
        'Leader College': l.college || '',
        'Leader Reg ID': l.registrationId || '',
        'Leader Payment': (l.paymentStatus || 'unpaid').toUpperCase(),
        'All Members': memberNames,
        'Member Full Details': memberDetails,
        'Created Date': t.createdAt ? new Date(t.createdAt).toLocaleString('en-IN') : ''
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 6 },   // S.No
      { wch: 22 },  // Team Name
      { wch: 14 },  // Team Code
      { wch: 24 },  // Event Name
      { wch: 16 },  // Event Category
      { wch: 16 },  // Members Count
      { wch: 24 },  // Team Leader
      { wch: 28 },  // Leader Email
      { wch: 15 },  // Leader Mobile
      { wch: 30 },  // Leader College
      { wch: 16 },  // Leader Reg ID
      { wch: 16 },  // Leader Payment
      { wch: 35 },  // All Members
      { wch: 60 },  // Member Full Details
      { wch: 22 },  // Created Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teams');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="techfest26-teams.xlsx"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// ADMIN: GET /api/admin/teams/export/csv
exports.exportTeamsCSV = async (req, res, next) => {
  try {
    const { search, event } = req.query;
    const filter = {};

    if (event) {
      const ev = await Event.findOne({ $or: [{ slug: event }, { _id: event.match(/^[0-9a-fA-F]{24}$/) ? event : null }] });
      if (ev) filter.event = ev._id;
    }

    if (search) {
      const users = await User.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { college: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      filter.$or = [
        { teamName: { $regex: search, $options: 'i' } },
        { teamCode: { $regex: search, $options: 'i' } },
        { leader: { $in: users.map(u => u._id) } },
        { members: { $in: users.map(u => u._id) } }
      ];
    }

    const teams = await Team.find(filter)
      .populate('event')
      .populate('leader')
      .populate('members')
      .sort({ createdAt: -1 });

    const enrichedTeams = await enrichTeamsWithRegistrations(teams);

    const headers = [
      'Team Name', 'Team Code', 'Event Name', 'Category', 'Members Count',
      'Team Leader', 'Leader Email', 'Leader Mobile', 'Leader College', 'Leader Reg ID', 'Leader Payment',
      'All Members', 'Member Details', 'Created At'
    ];

    const rows = enrichedTeams.map(t => {
      const e = t.event || {};
      const l = t.leader || {};
      const members = t.members || [];
      const memberNames = members.map(m => m.fullName).join(', ');
      const memberDetails = members.map(m => `${m.fullName} (${m.registrationId || 'N/A'} - ${m.paymentStatus || 'unpaid'})`).join(' | ');
      const rawCat = e.category || 'technical';
      const eventCategory = rawCat.toLowerCase() === 'non-technical' ? 'Non-Technical' : 'Technical';

      return [
        t.teamName,
        t.teamCode,
        e.name || '',
        eventCategory,
        `${members.length} / ${e.maxTeamSize || members.length}`,
        l.fullName || '',
        l.email || '',
        l.mobile || '',
        l.college || '',
        l.registrationId || '',
        (l.paymentStatus || 'unpaid').toUpperCase(),
        memberNames,
        memberDetails,
        t.createdAt ? new Date(t.createdAt).toLocaleString('en-IN') : ''
      ].map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="techfest26-teams.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

