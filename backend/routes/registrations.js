const express = require('express');
const router = express.Router();
const { createRegistration, getRegistrationByRegId } = require('../controllers/registrationController');

router.post('/', createRegistration);
router.get('/:registrationId', getRegistrationByRegId);

module.exports = router;
