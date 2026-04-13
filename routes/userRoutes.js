const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getUserGroups, getUserUpcomingSessions } = require('../controllers/userController');

// These routes power the personal dashboard and profile views.
router.get('/me/groups', auth, getUserGroups);
router.get('/me/sessions/upcoming', auth, getUserUpcomingSessions);

module.exports = router;