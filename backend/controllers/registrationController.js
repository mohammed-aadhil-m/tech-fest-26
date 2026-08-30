const User = require('../models/User');
const Team = require('../models/Team');
const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const { generateUniqueRegistrationId } = require('../utils/idGenerator');
const { registrationsToCSV } = require('../utils/csvExporter');
const { registrationsToExcel } = require('../utils/excelExporter');

// Helper to construct registration query filter
const buildRegistrationFilter = async (query) => {
  const { event, status, search } = query;
  const filter = {};
  if (status) filter.status = status;
  if (event) {
    const ev = await Event.findOne({ slug: event });
    if (ev) {
      filter.event = ev._id;
    } else if (/^[0-9a-fA-F]{24}$/.test(event)) {
      filter.event = event;
    }
  }

  if (search) {
    const users = await User.find({
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');

    filter.$or = [
      { registrationId: { $regex: search, $options: 'i' } },
      { user: { $in: users.map(u => u._id) } }
    ];
  }
  return filter;
};

// Helper to fetch registrations, events map, and mapped payments for export
const fetchExportData = async (req) => {
  const filter = await buildRegistrationFilter(req.query);
  const registrations = await EventRegistration.find(filter)
    .populate('event')
    .populate('user')
    .populate('team')
    .sort({ createdAt: -1 });

  // Load all events for foolproof fallback mapping
  const allEvents = await Event.find({});
  const eventsMap = new Map();
  allEvents.forEach(e => {
    eventsMap.set(e._id.toString(), e);
    eventsMap.set(e.slug, e);
  });

  const userIds = registrations.map(r => r.user?._id || r.user).filter(Boolean);
  const regIds = registrations.map(r => r.registrationId).filter(Boolean);

  // Fetch all user registration IDs so multi-event registrations share payment
  const allUserRegs = await EventRegistration.find({ user: { $in: userIds } }).select('registrationId user');
  const allUserRegIds = allUserRegs.map(r => r.registrationId);
  const combinedRegIds = Array.from(new Set([...regIds, ...allUserRegIds]));

  const payments = await Payment.find({
    $or: [
      { registrationId: { $in: combinedRegIds } },
      { registrationIds: { $in: combinedRegIds } },
      { user: { $in: userIds } }
    ]
  }).populate('user');

  const paymentsMap = new Map();
  payments.forEach(p => {
    if (p.registrationId) paymentsMap.set(p.registrationId, p);
    if (p.user) {
      const uId = p.user._id ? p.user._id.toString() : p.user.toString();
      paymentsMap.set(uId, p);
      if (p.user.email) paymentsMap.set(p.user.email.toLowerCase(), p);
      if (p.user.mobile) paymentsMap.set(p.user.mobile, p);
    }
    if (Array.isArray(p.registrationIds)) {
      p.registrationIds.forEach(id => paymentsMap.set(id, p));
    }
  });

  // Cross-link each user's registration IDs to their payment
  allUserRegs.forEach(ur => {
    const uId = ur.user ? ur.user.toString() : '';
    const pay = paymentsMap.get(ur.registrationId) || (uId && paymentsMap.get(uId));
    if (pay) {
      paymentsMap.set(ur.registrationId, pay);
      if (uId) paymentsMap.set(uId, pay);
    }
  });

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return { registrations, paymentsMap, eventsMap, baseUrl };
};


// POST /api/registrations
exports.createRegistration = async (req, res, next) => {
  try {
    const { fullName, email, mobile, college, department, year, foodPreference, selectedEvents } = req.body;

    if (!fullName || !email || !mobile || !college || !department || !year || !foodPreference) {
      return res.status(400).json({ success: false, message: 'All participant details are required.' });
    }
    if (!selectedEvents || !Array.isArray(selectedEvents) || selectedEvents.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one event.' });
    }

    // Upsert User
    let user = await User.findOne({ $or: [{ email }, { mobile }] });
    if (user) {
      user.fullName = fullName;
      user.college = college;
      user.department = department;
      user.year = year;
      user.foodPreference = foodPreference;
      await user.save();
    } else {
      user = await User.create({ fullName, email, mobile, college, department, year, foodPreference });
    }

    const createdRegistrations = [];

    // Process Events
    for (const sel of selectedEvents) {
      const { eventSlug, action, teamName, teamCode } = sel;
      const event = await Event.findOne({ slug: eventSlug, active: true, registrationOpen: true });
      if (!event) {
         throw new Error(`Event "${eventSlug}" not found or registration closed.`);
      }

      // Check if user already registered for this event
      const existingReg = await EventRegistration.findOne({ user: user._id, event: event._id });
      if (existingReg) {
         throw new Error(`You have already registered for "${event.name}".`);
      }

      const registrationId = await generateUniqueRegistrationId(EventRegistration);

      if (!event.isTeamEvent) {
        // INDIVIDUAL
        const reg = await EventRegistration.create({
          registrationId,
          user: user._id,
          event: event._id,
          registrationType: 'INDIVIDUAL'
        });
        createdRegistrations.push(reg);
      } else {
        // TEAM
        let team = null;
        if (action === 'create') {
          if (!teamName) throw new Error('Team name is required for creating a team.');
          
          // Generate unique Team Code
          let newTeamCode;
          let exists = true;
          while (exists) {
            newTeamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const t = await Team.findOne({ teamCode: newTeamCode });
            if (!t) exists = false;
          }

          team = await Team.create({
            teamName,
            teamCode: newTeamCode,
            event: event._id,
            leader: user._id,
            members: [user._id]
          });
        } else if (action === 'join') {
          if (!teamCode) throw new Error('Team code is required for joining a team.');
          team = await Team.findOne({ teamCode: teamCode.toUpperCase(), event: event._id });
          if (!team) throw new Error(`Invalid Team Code for ${event.name}.`);
          if (team.members.length >= event.maxTeamSize) throw new Error(`Team ${team.teamName} is full.`);
          
          team.members.push(user._id);
          await team.save();
        } else {
          throw new Error('Invalid team action. Must be "create" or "join".');
        }

        const reg = await EventRegistration.create({
          registrationId,
          user: user._id,
          event: event._id,
          registrationType: 'TEAM',
          team: team._id
        });
        createdRegistrations.push(reg);
      }
    }

    await EventRegistration.populate(createdRegistrations, [
      { path: 'event', select: 'name slug icon category' },
      { path: 'team' },
      { path: 'user' }
    ]);

    // We send back an array of registrations, but we can pass back the first registrationId for the redirect flow to work
    res.status(201).json({ 
      success: true, 
      data: createdRegistrations,
      registrationId: createdRegistrations[0].registrationId
    });
  } catch (err) {
    if (err.message && (err.message.includes('not found') || err.message.includes('already') || err.message.includes('Invalid') || err.message.includes('required') || err.message.includes('full'))) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// GET /api/registrations/:registrationId (public)
exports.getRegistrationByRegId = async (req, res, next) => {
  try {
    const reg = await EventRegistration.findOne({ registrationId: req.params.registrationId })
      .populate('event', 'name slug icon category')
      .populate('user')
      .populate({
        path: 'team',
        populate: { path: 'leader members', select: 'fullName' }
      });
      
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });

    // Since we now have multiple registrations per user session, let's also fetch all other registrations for this user 
    const allUserRegs = await EventRegistration.find({ user: reg.user._id })
      .populate('event', 'name slug icon category')
      .populate({
        path: 'team',
        populate: { path: 'leader members', select: 'fullName' }
      });

    res.json({ success: true, data: allUserRegs }); // returning array instead of single reg
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/registrations
exports.getAllRegistrations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = await buildRegistrationFilter(req.query);

    const total = await EventRegistration.countDocuments(filter);
    const registrations = await EventRegistration.find(filter)
      .populate('event', 'name slug icon category')
      .populate('user')
      .populate('team')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: registrations, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/registrations/:id
exports.getRegistration = async (req, res, next) => {
  try {
    const reg = await EventRegistration.findById(req.params.id)
      .populate('event')
      .populate('user')
      .populate('team');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, data: reg });
  } catch (err) { next(err); }
};

// ADMIN: PUT /api/admin/registrations/:id
exports.updateRegistration = async (req, res, next) => {
  try {
    const reg = await EventRegistration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, data: reg });
  } catch (err) { next(err); }
};

// ADMIN: DELETE /api/admin/registrations/:id
exports.deleteRegistration = async (req, res, next) => {
  try {
    const reg = await EventRegistration.findByIdAndDelete(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, message: 'Registration deleted.' });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/registrations/export/excel
exports.exportExcel = async (req, res, next) => {
  try {
    const { registrations, paymentsMap, eventsMap, baseUrl } = await fetchExportData(req);
    const excelBuffer = registrationsToExcel(registrations, paymentsMap, eventsMap, baseUrl);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="techfest26-registrations.xlsx"');
    res.send(excelBuffer);
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/registrations/export/csv
exports.exportCSV = async (req, res, next) => {
  try {
    const { registrations, paymentsMap, eventsMap, baseUrl } = await fetchExportData(req);
    const csv = registrationsToCSV(registrations, paymentsMap, eventsMap, baseUrl);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="techfest26-registrations.csv"');
    res.send(csv);
  } catch (err) { next(err); }
};


// ADMIN: GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const total = await EventRegistration.countDocuments();
    const User = require('../models/User');
    const totalUsers = await User.countDocuments();
    const Team = require('../models/Team');
    const totalTeams = await Team.countDocuments();
    
    res.json({ 
      success: true, 
      data: { 
        totalRegistrations: total, 
        totalUsers, 
        totalTeams 
      } 
    });
  } catch (err) { next(err); }
};

