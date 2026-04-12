const { Op } = require('sequelize');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Session = require('../models/session');

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