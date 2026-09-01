const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  fileName: { type: String },
  title: { type: String, trim: true },
  category: {
    type: String,
    enum: ['paper-presentation', 'dev-deploy', 'bug-buster', 'treasure-hunt', 'connect-sketch', 'overall'],
    default: 'overall'
  },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);
