const Schedule = require('../models/Schedule');

const DEFAULT_SCHEDULE = [
  { time: '09:00 AM', title: 'Registration & Check-in', description: 'Arrive at campus, check-in, and collect your event pass.', venue: 'Registration Desk, Main Block', order: 1 },
  { time: '09:30 AM', title: 'Inauguration Ceremony', description: 'Opening ceremony and welcome address by dignitaries.', venue: 'Auditorium', order: 2 },
  { time: '10:30 AM', title: 'Technical Events Begin', description: 'Paper Presentation, Dev & Deploy, Bug Buster.', venue: 'Respective Labs & Seminar Halls', order: 3 },
  { time: '12:30 PM', title: 'Lunch Break', description: 'Enjoy delicious lunch and refreshments provided on campus.', venue: 'Cafeteria', order: 4 },
  { time: '01:30 PM', title: 'Non-Technical Events Begin', description: 'Treasure Hunt 2.0, Connect & Sketch, Adaptune.', venue: 'Respective Venues', order: 5 },
  { time: '03:30 PM', title: 'Valedictory & Prize Distribution', description: 'Closing ceremony, certificate distribution, and winner announcements.', venue: 'Auditorium', order: 6 },
];

async function ensureDefaultSchedule() {
  const count = await Schedule.countDocuments();
  if (count === 0) {
    await Schedule.insertMany(DEFAULT_SCHEDULE);
  }
}

// GET /api/schedule (Public)
exports.getPublicSchedule = async (req, res, next) => {
  try {
    await ensureDefaultSchedule();
    const schedules = await Schedule.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
    res.json({ success: true, data: schedules });
  } catch (err) { next(err); }
};

// GET /api/admin/schedule (Admin)
exports.getAllSchedule = async (req, res, next) => {
  try {
    await ensureDefaultSchedule();
    const schedules = await Schedule.find().sort({ order: 1, createdAt: 1 }).lean();
    res.json({ success: true, data: schedules });
  } catch (err) { next(err); }
};

// POST /api/admin/schedule (Admin)
exports.createSchedule = async (req, res, next) => {
  try {
    const { time, title, description, venue, order, active } = req.body;
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null || finalOrder === '') {
      const highest = await Schedule.findOne().sort({ order: -1 }).lean();
      finalOrder = highest ? (highest.order || 0) + 1 : 1;
    }

    const schedule = await Schedule.create({
      time,
      title,
      description: description || '',
      venue: venue || '',
      order: Number(finalOrder) || 0,
      active: active !== undefined ? active : true
    });
    res.status(201).json({ success: true, data: schedule });
  } catch (err) { next(err); }
};

// PUT /api/admin/schedule/:id (Admin)
exports.updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule item not found.' });
    res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
};

// DELETE /api/admin/schedule/:id (Admin)
exports.deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule item not found.' });
    res.json({ success: true, message: 'Schedule item deleted.' });
  } catch (err) { next(err); }
};
