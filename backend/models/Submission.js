const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // Submitter / Author details
  registrationId: { type: String, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  mobile: { type: String, trim: true },
  college: { type: String, required: true, trim: true },
  department: { type: String, trim: true },
  year: { type: String },

  // Team details (Paper Presentation allows 1-3 members)
  teamName: { type: String, trim: true },
  teamCode: { type: String, uppercase: true, trim: true },

  // Paper & Topic details
  topic: { type: String, trim: true },
  paperTitle: { type: String, required: true, trim: true },
  abstract: { type: String, required: true },

  // Google Drive Link
  driveUrl: { type: String, trim: true },

  // File Upload
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
  if (!this.topic && this.paperTitle) {
    this.topic = this.paperTitle;
  }
  next();
});

module.exports = mongoose.model('Submission', submissionSchema);
