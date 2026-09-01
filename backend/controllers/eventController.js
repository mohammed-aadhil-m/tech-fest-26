const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Team = require('../models/Team');

// GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const filter = { active: true };
    if (req.query.category) filter.category = req.query.category;
    const events = await Event.find(filter).sort({ order: 1 }).lean();

    const eventIds = events.map(e => e._id);

    // Aggregate individual registrations per event (excluding cancelled)
    const regCounts = await EventRegistration.aggregate([
      { $match: { event: { $in: eventIds }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ]);
    const regCountMap = {};
    regCounts.forEach(r => {
      regCountMap[r._id.toString()] = r.count;
    });

    // Aggregate teams per event
    const teamCounts = await Team.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ]);
    const teamCountMap = {};
    teamCounts.forEach(t => {
      teamCountMap[t._id.toString()] = t.count;
    });

    const enrichedEvents = events.map(event => {
      const idStr = event._id.toString();
      const registrationCount = regCountMap[idStr] || 0;
      const teamCount = teamCountMap[idStr] || 0;
      return {
        ...event,
        registrationCount,
        teamCount,
        registeredCount: event.isTeamEvent ? teamCount : registrationCount
      };
    });

    res.json({ success: true, data: enrichedEvents });
  } catch (err) { next(err); }
};

// GET /api/events/:slug
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug, active: true }).lean();
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const registrationCount = await EventRegistration.countDocuments({ event: event._id, status: { $ne: 'cancelled' } });
    const teamCount = await Team.countDocuments({ event: event._id });

    res.json({
      success: true,
      data: {
        ...event,
        registrationCount,
        teamCount,
        registeredCount: event.isTeamEvent ? teamCount : registrationCount
      }
    });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/events
exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ order: 1 }).lean();
    const eventIds = events.map(e => e._id);

    const regCounts = await EventRegistration.aggregate([
      { $match: { event: { $in: eventIds }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ]);
    const regCountMap = {};
    regCounts.forEach(r => {
      regCountMap[r._id.toString()] = r.count;
    });

    const teamCounts = await Team.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ]);
    const teamCountMap = {};
    teamCounts.forEach(t => {
      teamCountMap[t._id.toString()] = t.count;
    });

    const enrichedEvents = events.map(event => {
      const idStr = event._id.toString();
      const registrationCount = regCountMap[idStr] || 0;
      const teamCount = teamCountMap[idStr] || 0;
      return {
        ...event,
        registrationCount,
        teamCount,
        registeredCount: event.isTeamEvent ? teamCount : registrationCount
      };
    });

    res.json({ success: true, data: enrichedEvents });
  } catch (err) { next(err); }
};

// ADMIN: POST /api/admin/events
exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
};

// ADMIN: PUT /api/admin/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

// ADMIN: DELETE /api/admin/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) { next(err); }
};
