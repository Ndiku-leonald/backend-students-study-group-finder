const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation
} = require('../controllers/invitationController');

router.get('/', auth, getMyInvitations);
router.post('/:invitationId/accept', auth, acceptInvitation);
router.post('/:invitationId/reject', auth, rejectInvitation);

module.exports = router;