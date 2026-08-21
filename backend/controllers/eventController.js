const Event = require('../models/Event');

// GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const filter = { active: true };
    if (req.query.category) filter.category = req.query.category;
    const events = await Event.find(filter).sort({ order: 1 });
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

// GET /api/events/:slug
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug, active: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/events
exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ order: 1 });
    res.json({ success: true, data: events });
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
