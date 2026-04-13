const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
	getMyProfile,
	updateMyProfile,
	getUserGroups,
	getUserUpcomingSessions
} = require('../controllers/userController');

router.get('/me', auth, getMyProfile);
router.put('/me', auth, updateMyProfile);
router.get('/me/groups', auth, getUserGroups);
router.get('/me/sessions/upcoming', auth, getUserUpcomingSessions);

module.exports = router;