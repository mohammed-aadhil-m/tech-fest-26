const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadGallery, uploadWinnerPhoto } = require('../middleware/upload');

// Event controllers
const { getAllEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
// Registration controllers
const { getAllRegistrations, getRegistration, updateRegistration, deleteRegistration, exportCSV, getStats } = require('../controllers/registrationController');
// Submission controllers
const { getAllSubmissions, getSubmission, updateSubmission, deleteSubmission } = require('../controllers/submissionController');
// Winner controllers
const { getAllWinners, createWinner, updateWinner, deleteWinner } = require('../controllers/winnerController');
// Gallery controllers
const { getAllImages, uploadImage, deleteImage } = require('../controllers/galleryController');
// Setting controllers
const { getAllSettings, updateSetting, updateSettings } = require('../controllers/settingController');
// Payment controllers
const { getAllPayments, updatePayment } = require('../controllers/paymentController');

// Apply auth middleware to all admin routes
router.use(protect);

// Dashboard stats
router.get('/stats', getStats);

// Events
router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

// Registrations
router.get('/registrations', getAllRegistrations);
router.get('/registrations/export/csv', exportCSV);
router.get('/registrations/:id', getRegistration);
router.put('/registrations/:id', updateRegistration);
router.delete('/registrations/:id', deleteRegistration);

// Submissions
router.get('/submissions', getAllSubmissions);
router.get('/submissions/:id', getSubmission);
router.put('/submissions/:id', updateSubmission);
router.delete('/submissions/:id', deleteSubmission);

// Winners
router.get('/winners', getAllWinners);
router.post('/winners', (req, res, next) => {
  uploadWinnerPhoto(req, res, (err) => { if (err) return next(err); next(); });
}, createWinner);
router.put('/winners/:id', (req, res, next) => {
  uploadWinnerPhoto(req, res, (err) => { if (err) return next(err); next(); });
}, updateWinner);
router.delete('/winners/:id', deleteWinner);

// Gallery
router.get('/gallery', getAllImages);
router.post('/gallery', (req, res, next) => {
  uploadGallery(req, res, (err) => { if (err) return next(err); next(); });
}, uploadImage);
router.delete('/gallery/:id', deleteImage);

// Settings
router.get('/settings', getAllSettings);
router.put('/settings', updateSettings);
router.put('/settings/:key', updateSetting);

// Payments
router.get('/payments', getAllPayments);
router.put('/payments/:id', updatePayment);

module.exports = router;
