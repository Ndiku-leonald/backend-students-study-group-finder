const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
	createGroup,
	getGroups,
	searchGroups,
	joinGroup,
	updateGroup,
	getGroupMembers,
	removeMember
} = require('../controllers/groupController');
const { inviteMember } = require('../controllers/invitationController');

router.get('/', getGroups);
router.get('/search', searchGroups);
router.get('/:groupId/members', auth, getGroupMembers);
router.post('/join/:groupId', auth, joinGroup);
router.post('/create', auth, createGroup);
router.put('/:groupId', auth, updateGroup);
router.delete('/:groupId/members/:userId', auth, removeMember);
router.post('/:groupId/invitations', auth, inviteMember);

module.exports = router;