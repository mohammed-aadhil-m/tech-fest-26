const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  time: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  venue: { type: String, trim: true, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

scheduleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Schedule', scheduleSchema);
