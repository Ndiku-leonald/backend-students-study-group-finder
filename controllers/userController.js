const { Op } = require('sequelize');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Session = require('../models/session');
const User = require('../models/user');

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'program', 'year', 'role', 'adminCode', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextName = req.body.name ?? user.name;
    const nextProgram = user.role === 'student' ? (req.body.program ?? user.program) : null;
    const nextYearRaw = user.role === 'student' ? (req.body.year ?? user.year) : null;
    const nextYear = nextYearRaw === null || nextYearRaw === '' ? null : Number(nextYearRaw);

    if (!nextName || !String(nextName).trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (user.role === 'student' && (nextYearRaw !== null && nextYearRaw !== '') && Number.isNaN(nextYear)) {
      return res.status(400).json({ message: 'Year must be a valid number' });
    }

    await user.update({
      name: String(nextName).trim(),
      program: nextProgram,
      year: nextYear
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      program: user.program,
      year: user.year,
      role: user.role,
      adminCode: user.adminCode
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const memberships = await GroupMember.findAll({
      where: { userId: req.user.id }
    });

    const groupIds = memberships.map((membership) => membership.groupId);

    const memberGroupFilter = groupIds.length
      ? { id: { [Op.in]: groupIds } }
      : { id: { [Op.in]: [0] } };

    const groups = await Group.findAll({
      where: {
        [Op.or]: [
          memberGroupFilter,
          { userId: req.user.id }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserUpcomingSessions = async (req, res) => {
  try {
    const memberships = await GroupMember.findAll({
      where: { userId: req.user.id }
    });

    const groupIds = memberships.map((membership) => membership.groupId);

    const sessions = await Session.findAll({
      where: {
        groupId: groupIds.length ? { [Op.in]: groupIds } : { [Op.in]: [0] },
        date: {
          [Op.gte]: new Date()
        }
      },
      order: [['date', 'ASC']]
    });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};