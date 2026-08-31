const Setting = require('../models/Setting');

// GET /api/settings (public - selected settings)
exports.getPublicSettings = async (req, res, next) => {
  try {
    const publicKeys = [
      'eventDate', 'registrationDeadline', 'contactEmail', 'contactPhone',
      'mapEmbedUrl', 'instagramUrl', 'facebookUrl', 'youtubeUrl', 'twitterUrl',
      'registrationOpen', 'upiId', 'upiPayeeName', 'registrationFee'
    ];
    const settings = await Setting.find({ key: { $in: publicKeys } });
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/settings
exports.getAllSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find().sort({ key: 1 });
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// ADMIN: PUT /api/admin/settings/:key
exports.updateSetting = async (req, res, next) => {
  try {
    const { value } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: setting });
  } catch (err) { next(err); }
};

// ADMIN: PUT /api/admin/settings (bulk update)
exports.updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // { key: value, key2: value2 }
    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const setting = await Setting.findOneAndUpdate(
        { key },
        { value, updatedAt: Date.now() },
        { new: true, upsert: true }
      );
      results.push(setting);
    }
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};
