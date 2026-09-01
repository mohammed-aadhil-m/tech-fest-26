const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registrationId: { type: String, required: true, unique: true },
  // Participant details
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  college: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  year: { type: String, required: true, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  foodPreference: { type: String, required: true, enum: ['Veg', 'Non-Veg'] },
  // Multiple events (up to 4)
  events: [{
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    eventName: { type: String },
    eventSlug: { type: String },
    eventCategory: { type: String },
    // Team details per event (if team event)
    isTeamRegistration: { type: Boolean, default: false },
    teamName: { type: String, trim: true },
    teamLeader: { type: String, trim: true },
    teamMembers: [{
      name: { type: String, trim: true },
      email: { type: String, trim: true },
      mobile: { type: String, trim: true },
      college: { type: String, trim: true },
    }]
  }],
  // Convenience fields (first event, for backward compat display)
  eventName: { type: String },
  eventCategory: { type: String },
  // Status
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'attended', 'disqualified', 'cancelled'],
    default: 'registered'
  },
  // Payment
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid', 'rejected'],
    default: 'unpaid'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

registrationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);
