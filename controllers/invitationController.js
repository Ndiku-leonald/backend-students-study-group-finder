const Invitation = require('../models/Invitation');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/user');

const isGroupLeader = (group, userId) => group.userId === userId;

exports.inviteMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { inviteeEmail, inviteeId } = req.body;

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

exports.getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.findAll({
      where: { inviteeId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(invitations);
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