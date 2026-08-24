const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Verify a team code before joining
router.get('/verify/:teamCode', teamController.verifyTeamCode);

module.exports = router;
