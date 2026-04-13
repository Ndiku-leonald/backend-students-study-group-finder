const { Op, Sequelize } = require('sequelize');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Session = require('../models/session');
const Post = require('../models/Post');
const User = require('../models/user');

const safeCount = async (model, where = {}) => {
  try {
    return await model.count({ where });
  } catch {
    return 0;
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
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

    res.json({ myGroups, upcomingSessions, recentGroups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, totalGroups, totalSessions, groups] = await Promise.all([
      User.count(),
      Group.count(),
      Session.count(),
      Group.findAll()
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

    const groupWorkRaw = await Promise.all(
      groups.map(async (group) => {
        const [memberCount, postCount, sessionCount] = await Promise.all([
          safeCount(GroupMember, { groupId: group.id }),
          safeCount(Post, { groupId: group.id }),
          safeCount(Session, { groupId: group.id })
        ]);

        const activityScore = postCount + sessionCount + memberCount;

        return {
          id: group.id,
          name: group.name,
          course: group.course,
          memberCount,
          postCount,
          sessionCount,
          activityScore
        };
      })
    );

    const groupWork = groupWorkRaw
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 10);

    res.json({
      totalUsers,
      totalGroups,
      totalSessions,
      mostActiveCourses,
      groupWork
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};