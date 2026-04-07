const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createGroup } = require('../controllers/groupController');

router.post('/create', auth, createGroup);

module.exports = router;