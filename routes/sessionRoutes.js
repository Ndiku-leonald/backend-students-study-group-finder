const express = require('express');
const router = express.Router();
const { createSession } = require('../controllers/sessionControllers');

router.post('/create', createSession);

module.exports = router;