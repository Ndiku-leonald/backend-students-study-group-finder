const { Op } = require('sequelize');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/user');
const Session = require('../models/session');

// A leader is the user that created the group.
const isGroupLeader = (group, userId) => group.userId === userId;

exports.createGroup = async (req, res) => {
  try {
    // Keep group creation minimal and consistent with the frontend form.
    // The leader is inferred from the JWT, not supplied by the client.
    const { name, course, faculty, description, location } = req.body;

    if (!name || !course) {
      return res.status(400).json({ message: 'Name and course are required' });
    }

    const group = await Group.create({
      name,
      course,
      faculty: faculty || null,
      description: description || null,
      location: location || null,
      userId: req.user.id
    });

    await GroupMember.create({
      userId: req.user.id,
      groupId: group.id
    });

    // The creator is automatically added as the first member.
    // This avoids special-case logic later when checking membership.
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    // Include the leader name so the directory cards can show ownership.
    // The UI expects a single, already-shaped payload rather than raw Sequelize rows.
    const groups = await Group.findAll({
      include: [{ model: User, as: 'Leader', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    const result = await Promise.all(
      groups.map(async (group) => {
        const members = await GroupMember.count({
          where: { groupId: group.id }
        });

        return {
          ...group.toJSON(),
          members,
          leader: group.Leader ? group.Leader.name : 'Unknown'
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [{ model: User, as: 'Leader', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const result = await Promise.all(
      groups.map(async (group) => {
        const members = await GroupMember.count({
          where: { groupId: group.id }
        });

        return {
          ...group.toJSON(),
          members,
          leader: group.Leader ? group.Leader.name : 'Unknown'
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchGroups = async (req, res) => {
  try {
    // Search across the most visible group fields.
    // The query is broad on purpose so students can find groups by course, faculty, or location.
    const q = req.query.q || '';
    const groups = await Group.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { course: { [Op.like]: `%${q}%` } },
          { faculty: { [Op.like]: `%${q}%` } },
          { location: { [Op.like]: `%${q}%` } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroup = async (req, res) => {
  try {
    // Expand the base group record with its leader name and member count.
    // Group detail pages use this endpoint to render the summary header.
    const group = await Group.findByPk(req.params.groupId, {
      include: [{ model: User, as: 'Leader', attributes: ['name'] }]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const members = await GroupMember.count({
      where: { groupId: group.id }
    });

    res.json({
      ...group.toJSON(),
      members,
      leader: group.Leader ? group.Leader.name : 'Unknown'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupSessions = async (req, res) => {
  try {
    // Only the leader or an existing member can inspect the group schedule.
    // This prevents strangers from seeing private group planning details.
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
};

exports.joinGroup = async (req, res) => {
  try {
    // Joining a group is represented by a membership row.
    // That join table is what drives access to posts, sessions, and invites.
    const { groupId } = req.params;

    const membership = await GroupMember.create({
      groupId,
      userId: req.user.id
    });

    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    // Leaders can update their group metadata without touching membership.
    // This keeps admin-style editing separate from member access.
    const group = await Group.findByPk(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!isGroupLeader(group, req.user.id)) {
      return res.status(403).json({ message: 'Only the group leader can update this group' });
    }

    await group.update({
      name: req.body.name ?? group.name,
      course: req.body.course ?? group.course,
      faculty: req.body.faculty ?? group.faculty,
      description: req.body.description ?? group.description,
      location: req.body.location ?? group.location
    });

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupMembers = async (req, res) => {
  try {
    // Resolve membership rows to the public user profile fields.
    // The response is intentionally filtered so private data stays hidden.
    const group = await Group.findByPk(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const memberships = await GroupMember.findAll({
      where: { groupId: group.id }
    });

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await User.findByPk(membership.userId, {
          attributes: ['id', 'name', 'email', 'program', 'year', 'role']
        });

        return user;
      })
    );

    res.json(members.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    // Only the leader can remove members, and never themselves.
    // This preserves the group owner as the one account with full control.
    const group = await Group.findByPk(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!isGroupLeader(group, req.user.id)) {
      return res.status(403).json({ message: 'Only the group leader can remove members' });
    }

    if (Number(req.params.userId) === group.userId) {
      return res.status(400).json({ message: 'Leader cannot be removed from the group' });
    }

    const deleted = await GroupMember.destroy({
      where: {
        groupId: group.id,
        userId: req.params.userId
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Member not found in group' });
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
