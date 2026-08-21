const express = require('express');
const router = express.Router();
const { getEvents, getEvent } = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/:slug', getEvent);

module.exports = router;
