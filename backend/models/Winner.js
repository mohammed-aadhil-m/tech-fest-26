const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  eventName: { type: String, required: true },
  position: { type: String, enum: ['1st', '2nd', '3rd'], required: true },
  participantName: { type: String, required: true, trim: true },
  teamName: { type: String, trim: true },
  college: { type: String, trim: true },
  photoUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Winner', winnerSchema);
