const { Op, Sequelize } = require('sequelize');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Session = require('../models/session');
const User = require('../models/user');

exports.getStudentDashboard = async (req, res) => {
  try {
    // Resolve the groups the student belongs to so we can reuse the IDs below.
    // The dashboard is built from multiple small queries rather than one giant join.
    const memberships = await GroupMember.findAll({
      where: { userId: req.user.id }
    });

    const groupIds = memberships.map((membership) => membership.groupId);

    const memberGroupFilter = groupIds.length
      ? { id: { [Op.in]: groupIds } }
      : { id: { [Op.in]: [0] } };

    const myGroups = await Group.findAll({
      where: {
        [Op.or]: [
          memberGroupFilter,
          { userId: req.user.id }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    const upcomingSessions = await Session.findAll({
      where: {
        groupId: groupIds.length ? { [Op.in]: groupIds } : { [Op.in]: [0] },
        date: {
          [Op.gte]: new Date()
        }
      },
      order: [['date', 'ASC']]
    });

    const recentGroups = await Group.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Return the full dashboard payload in one response to keep the UI simple.
    // The frontend can render cards and lists immediately from this payload.
    res.json({ myGroups, upcomingSessions, recentGroups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    // Platform-wide counters are fetched in parallel for a faster dashboard load.
    // This gives admins a quick overview without navigating through each table manually.
    const [totalUsers, totalGroups, totalSessions] = await Promise.all([
      User.count(),
      Group.count(),
      Session.count()
    ]);

    const mostActiveCourses = await Group.findAll({
      attributes: [
        'course',
        [Sequelize.fn('COUNT', Sequelize.col('course')), 'groupCount']
      ],
      group: ['course'],
      order: [[Sequelize.literal('groupCount'), 'DESC']],
      limit: 5
    });

    res.json({
      totalUsers,
      totalGroups,
      totalSessions,
      mostActiveCourses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};