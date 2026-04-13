const Invitation = require('../models/Invitation');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/user');

const isGroupLeader = (group, userId) => group.userId === userId;

exports.inviteMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const inviteeEmail = (req.body.inviteeEmail || req.body.email || '').trim().toLowerCase();
    const { inviteeId } = req.body;

    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!isGroupLeader(group, req.user.id)) {
      return res.status(403).json({ message: 'Only the group leader can invite members' });
    }

    const targetUser = inviteeId
      ? await User.findByPk(inviteeId)
      : await User.findOne({ where: { email: inviteeEmail } });

    if (!targetUser) {
      return res.status(404).json({ message: 'Invitee not found' });
    }

    const existingMembership = await GroupMember.findOne({
      where: { groupId: group.id, userId: targetUser.id }
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }

    const invitation = await Invitation.create({
      groupId: group.id,
      inviterId: req.user.id,
      inviteeId: targetUser.id
    });

    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyInvitations = exports.getPendingInvites = async (req, res) => {
  try {
    const invitations = await Invitation.findAll({
      where: { inviteeId: req.user.id, status: 'pending' },
      include: [
        { model: Group, attributes: ['name'] },
        { model: User, as: 'Inviter', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const result = invitations.map(inv => ({
      id: inv.id,
      groupName: inv.Group ? inv.Group.name : 'Unknown Group',
      inviterName: inv.Inviter ? inv.Inviter.name : 'Unknown',
      createdAt: inv.createdAt
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findByPk(req.params.invitationId);

    if (!invitation || invitation.inviteeId !== req.user.id) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    invitation.status = 'accepted';
    await invitation.save();

    await GroupMember.findOrCreate({
      where: {
        groupId: invitation.groupId,
        userId: req.user.id
      }
    });

    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findByPk(req.params.invitationId);

    if (!invitation || invitation.inviteeId !== req.user.id) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    invitation.status = 'rejected';
    await invitation.save();

    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.respondToInvite = async (req, res) => {
  try {
    const { response } = req.body;
    const invitation = await Invitation.findByPk(req.params.invitationId);

    if (!invitation || invitation.inviteeId !== req.user.id) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (response === 'accept') {
      invitation.status = 'accepted';
      await invitation.save();

      await GroupMember.findOrCreate({
        where: {
          groupId: invitation.groupId,
          userId: req.user.id
        }
      });
    } else if (response === 'decline') {
      invitation.status = 'rejected';
      await invitation.save();
    } else {
      return res.status(400).json({ message: 'Invalid response' });
    }

    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};