const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
	createGroup,
	getGroups,
	getRecentGroups,
	searchGroups,
	getGroup,
	getGroupSessions,
	joinGroup,
	updateGroup,
	getGroupMembers,
	removeMember,
	deleteGroup
} = require('../controllers/groupController');
const { getGroupPosts } = require('../controllers/postController');
const { inviteMember } = require('../controllers/invitationController');

// Public directory and search routes stay readable without a token.
router.get('/', getGroups);
router.get('/recent', getRecentGroups);
router.get('/search', searchGroups);
router.get('/:groupId', getGroup);
router.get('/:groupId/members', auth, getGroupMembers);
router.get('/:groupId/sessions', auth, getGroupSessions);
router.get('/:groupId/posts', auth, getGroupPosts);
router.post('/join/:groupId', auth, joinGroup);
router.post('/create', auth, createGroup);
router.put('/:groupId', auth, updateGroup);
router.delete('/:groupId', auth, deleteGroup);
router.delete('/:groupId/members/:userId', auth, removeMember);
// Older frontend screens still call both invite paths, so both stay supported.
router.post('/:groupId/invitations', auth, inviteMember);
router.post('/:groupId/invites', auth, inviteMember);

module.exports = router;