const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // Submitter details
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  mobile: { type: String, trim: true },
  college: { type: String, required: true, trim: true },
  department: { type: String, trim: true },
  year: { type: String },
  // Paper details
  paperTitle: { type: String, required: true, trim: true },
  abstract: { type: String, required: true },
  // File
  fileUrl: { type: String },
  fileName: { type: String },
  // Status
  status: {
    type: String,
    enum: ['pending', 'selected', 'rejected'],
    default: 'pending'
  },
  adminNotes: { type: String },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

submissionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Submission', submissionSchema);
