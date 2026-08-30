const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadGallery, uploadWinnerPhoto } = require('../middleware/upload');

// Event controllers
const { getAllEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
// Registration controllers
const { getAllRegistrations, getRegistration, updateRegistration, deleteRegistration, exportCSV, exportExcel, getStats } = require('../controllers/registrationController');
// Submission controllers
const { getAllSubmissions, getSubmission, updateSubmission, deleteSubmission, exportExcel: exportSubmissionExcel, exportCSV: exportSubmissionCSV } = require('../controllers/submissionController');
// Winner controllers
const { getAllWinners, createWinner, updateWinner, deleteWinner } = require('../controllers/winnerController');
// Gallery controllers
const { getAllImages, uploadImage, deleteImage } = require('../controllers/galleryController');
// Setting controllers
const { getAllSettings, updateSetting, updateSettings } = require('../controllers/settingController');
// Schedule controllers
const { getAllSchedule, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
// Payment controllers
const { getAllPayments, updatePayment } = require('../controllers/paymentController');
// Team controllers
const { getAllTeams, getTeam, deleteTeam, exportTeamsExcel, exportTeamsCSV } = require('../controllers/teamController');

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
router.get('/registrations/export/excel', exportExcel);
router.get('/registrations/export/csv', exportCSV);
router.get('/registrations/:id', getRegistration);
router.put('/registrations/:id', updateRegistration);
router.delete('/registrations/:id', deleteRegistration);

// Teams
router.get('/teams', getAllTeams);
router.get('/teams/export/excel', exportTeamsExcel);
router.get('/teams/export/csv', exportTeamsCSV);
router.get('/teams/:id', getTeam);
router.delete('/teams/:id', deleteTeam);

// Submissions
router.get('/submissions', getAllSubmissions);
router.get('/submissions/export/excel', exportSubmissionExcel);
router.get('/submissions/export/csv', exportSubmissionCSV);
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

// Schedule
router.get('/schedule', getAllSchedule);
router.post('/schedule', createSchedule);
router.put('/schedule/:id', updateSchedule);
router.delete('/schedule/:id', deleteSchedule);

// Payments
router.get('/payments', getAllPayments);
router.put('/payments/:id', updatePayment);

module.exports = router;
