const express = require('express');
const router = express.Router();
const { getWinners } = require('../controllers/winnerController');

router.get('/', getWinners);

module.exports = router;
