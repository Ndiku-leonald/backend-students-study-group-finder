const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getMyInvitations,
  getPendingInvites,
  acceptInvitation,
  rejectInvitation,
  respondToInvite
} = require('../controllers/invitationController');

router.get('/', auth, getMyInvitations);
router.get('/pending', auth, getPendingInvites);
router.post('/:invitationId/accept', auth, acceptInvitation);
router.post('/:invitationId/reject', auth, rejectInvitation);
router.post('/:invitationId/respond', auth, respondToInvite);

module.exports = router;