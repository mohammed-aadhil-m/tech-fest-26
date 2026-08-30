const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  registrationId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  registrationType: { type: String, enum: ['INDIVIDUAL', 'TEAM'], required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'attended', 'disqualified', 'cancelled'],
    default: 'registered'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid', 'rejected'],
    default: 'unpaid'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

eventRegistrationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index to prevent a user from registering for the same event multiple times
eventRegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
