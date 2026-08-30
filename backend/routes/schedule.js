const express = require('express');
const router = express.Router();
const { getPublicSchedule } = require('../controllers/scheduleController');

router.get('/', getPublicSchedule);

module.exports = router;
