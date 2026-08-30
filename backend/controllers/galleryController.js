const Gallery = require('../models/Gallery');

// GET /api/gallery (public)
exports.getGallery = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const images = await Gallery.find(filter).sort({ uploadedAt: -1 });
    res.json({ success: true, data: images });
  } catch (err) { next(err); }
};

// ADMIN: POST /api/admin/gallery
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided.' });
    const { title, category } = req.body;
    const image = await Gallery.create({
      imageUrl: `/uploads/gallery/${req.file.filename}`,
      fileName: req.file.originalname,
      title,
      category: category || 'overall'
    });
    res.status(201).json({ success: true, data: image });
  } catch (err) { next(err); }
};

// ADMIN: DELETE /api/admin/gallery/:id
exports.deleteImage = async (req, res, next) => {
  try {
    const img = await Gallery.findByIdAndDelete(req.params.id);
    if (!img) return res.status(404).json({ success: false, message: 'Image not found.' });
    res.json({ success: true, message: 'Image deleted.' });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/gallery
exports.getAllImages = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const images = await Gallery.find(filter).sort({ uploadedAt: -1 });
    res.json({ success: true, data: images });
  } catch (err) { next(err); }
};
