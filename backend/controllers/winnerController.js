const Winner = require('../models/Winner');

// GET /api/winners (public)
exports.getWinners = async (req, res, next) => {
  try {
    const winners = await Winner.find().populate('event', 'name slug icon category').sort({ createdAt: -1 });
    res.json({ success: true, data: winners });
  } catch (err) { next(err); }
};

// ADMIN: POST /api/admin/winners
exports.createWinner = async (req, res, next) => {
  try {
    const { event, eventName, position, participantName, teamName, college } = req.body;
    const winnerData = { event, eventName, position, participantName, teamName, college };
    if (req.file) winnerData.photoUrl = `/uploads/winners/${req.file.filename}`;
    const winner = await Winner.create(winnerData);
    res.status(201).json({ success: true, data: winner });
  } catch (err) { next(err); }
};

// ADMIN: PUT /api/admin/winners/:id
exports.updateWinner = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.photoUrl = `/uploads/winners/${req.file.filename}`;
    const winner = await Winner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found.' });
    res.json({ success: true, data: winner });
  } catch (err) { next(err); }
};

// ADMIN: DELETE /api/admin/winners/:id
exports.deleteWinner = async (req, res, next) => {
  try {
    await Winner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Winner deleted.' });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/winners
exports.getAllWinners = async (req, res, next) => {
  try {
    const winners = await Winner.find().populate('event', 'name slug icon category').sort({ eventName: 1, position: 1 });
    res.json({ success: true, data: winners });
  } catch (err) { next(err); }
};
