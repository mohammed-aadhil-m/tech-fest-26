const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { generateUniqueRegistrationId } = require('../utils/idGenerator');
const { registrationsToCSV } = require('../utils/csvExporter');

// POST /api/registrations  — supports up to 4 events
exports.createRegistration = async (req, res, next) => {
  try {
    const { fullName, email, mobile, college, department, year, foodPreference, selectedEvents } = req.body;

    // Validate required fields
    if (!fullName || !email || !mobile || !college || !department || !year || !foodPreference) {
      return res.status(400).json({ success: false, message: 'All participant details are required.' });
    }
    if (!selectedEvents || !Array.isArray(selectedEvents) || selectedEvents.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one event.' });
    }
    if (selectedEvents.length > 4) {
      return res.status(400).json({ success: false, message: 'You can register for a maximum of 4 events.' });
    }

    // Check for duplicate registration (same email already registered — check per event)
    const eventsData = [];
    for (const sel of selectedEvents) {
      const { eventSlug, teamName, teamLeader, teamMembers } = sel;
      const event = await Event.findOne({ slug: eventSlug, active: true, registrationOpen: true });
      if (!event) {
        return res.status(404).json({ success: false, message: `Event "${eventSlug}" not found or registration is closed.` });
      }
      if (event.category === 'coming-soon') {
        return res.status(400).json({ success: false, message: `Registration is not open for "${event.name}" yet.` });
      }
      // Check duplicate per event
      const existing = await Registration.findOne({ email, 'events.event': event._id });
      if (existing) {
        return res.status(409).json({ success: false, message: `You have already registered for "${event.name}" with this email.` });
      }
      const eventEntry = {
        event: event._id,
        eventName: event.name,
        eventSlug: event.slug,
        eventCategory: event.category,
        isTeamRegistration: event.isTeamEvent,
      };
      if (event.isTeamEvent) {
        eventEntry.teamName = teamName;
        eventEntry.teamLeader = teamLeader;
        eventEntry.teamMembers = teamMembers || [];
      }
      eventsData.push(eventEntry);
    }

    const registrationId = await generateUniqueRegistrationId(Registration);

    const registration = await Registration.create({
      registrationId,
      fullName, email, mobile, college, department, year, foodPreference,
      events: eventsData,
      // convenience fields from first event
      eventName: eventsData.map(e => e.eventName).join(', '),
      eventCategory: eventsData[0]?.eventCategory,
    });

    await registration.populate('events.event', 'name slug icon category');

    res.status(201).json({ success: true, data: registration });
  } catch (err) { next(err); }
};

// GET /api/registrations/:registrationId (public - for pass lookup)
exports.getRegistrationByRegId = async (req, res, next) => {
  try {
    const reg = await Registration.findOne({ registrationId: req.params.registrationId })
      .populate('events.event', 'name slug icon category');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, data: reg });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/registrations
exports.getAllRegistrations = async (req, res, next) => {
  try {
    const { event, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (event) filter.eventName = { $regex: event, $options: 'i' };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registrationId: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Registration.countDocuments(filter);
    const registrations = await Registration.find(filter)
      .populate('events.event', 'name slug icon category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: registrations, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/registrations/:id
exports.getRegistration = async (req, res, next) => {
  try {
    const reg = await Registration.findById(req.params.id).populate('events.event');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, data: reg });
  } catch (err) { next(err); }
};

// ADMIN: PUT /api/admin/registrations/:id
exports.updateRegistration = async (req, res, next) => {
  try {
    const reg = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, data: reg });
  } catch (err) { next(err); }
};

// ADMIN: DELETE /api/admin/registrations/:id
exports.deleteRegistration = async (req, res, next) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, message: 'Registration deleted.' });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/registrations/export/csv
exports.exportCSV = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) filter.eventName = { $regex: req.query.event, $options: 'i' };
    const registrations = await Registration.find(filter).sort({ createdAt: -1 });
    const csv = registrationsToCSV(registrations);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="techfest26-registrations.csv"');
    res.send(csv);
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const total = await Registration.countDocuments();
    const technical = await Registration.countDocuments({ eventCategory: 'technical' });
    const nonTechnical = await Registration.countDocuments({ eventCategory: 'non-technical' });
    const recent = await Registration.find().sort({ createdAt: -1 }).limit(5).populate('events.event', 'name icon');
    const byEvent = await Registration.aggregate([
      { $group: { _id: '$eventName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const Submission = require('../models/Submission');
    const submissions = await Submission.countDocuments();

    res.json({ success: true, data: { total, technical, nonTechnical, submissions, recent, byEvent } });
  } catch (err) { next(err); }
};
