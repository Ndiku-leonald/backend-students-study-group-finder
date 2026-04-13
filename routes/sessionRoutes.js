const express = require('express');
const router = express.Router();
const { createSession } = require('../controllers/sessionControllers');
const auth = require('../middleware/authMiddleware');
const GroupMember = require('../models/GroupMember');
const Group = require('../models/Group');
const Session = require('../models/session');

router.post('/create', auth, createSession);

// This route mirrors the controller logic so group session pages can load directly.
router.get('/group/:groupId', auth, async (req, res) => {
	try {
		const group = await Group.findByPk(req.params.groupId);

		if (!group) {
			return res.status(404).json({ message: 'Group not found' });
		}

		const isMember = group.userId === req.user.id;
		const membership = await GroupMember.findOne({
			where: {
				groupId: group.id,
				userId: req.user.id
			}
		});

		if (!isMember && !membership) {
			return res.status(403).json({ message: 'You must be a group member to view sessions' });
		}

		const sessions = await Session.findAll({
			where: { groupId: req.params.groupId },
			order: [['date', 'ASC']]
		});

		res.json(sessions);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;