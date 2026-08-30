const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  shortName: { type: String, trim: true },
  icon: { type: String, default: '🎯' },
  category: { type: String, enum: ['technical', 'non-technical', 'coming-soon'], required: true },
  description: { type: String },
  fullDescription: { type: String },
  rules: [{ type: String }],
  rounds: [{
    roundNumber: Number,
    title: String,
    description: String,
    rules: [String]
  }],
  evaluationCriteria: [{
    title: String,
    description: String
  }],
  tagline: { type: String },
  submissionEmail: { type: String },
  submissionDeadline: { type: Date },
  maxTeamSize: { type: Number, default: 1 },
  minTeamSize: { type: Number, default: 1 },
  isTeamEvent: { type: Boolean, default: false },
  registrationOpen: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

eventSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Event', eventSchema);
