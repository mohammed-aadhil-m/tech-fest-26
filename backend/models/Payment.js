const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  registrationId: { type: String, required: true },
  registrationIds: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionId: { type: String, required: true, trim: true },
  paymentPhone: { type: String, required: true, trim: true },
  screenshotUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

paymentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

