const { Op } = require('sequelize');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');

exports.createGroup = async (req, res) => {
  try {
    const group = await Group.create({
      ...req.body,
      userId: req.user.id
    });

    await GroupMember.create({
      userId: req.user.id,
      groupId: group.id,
      role: "leader"
    });

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({ order: [['createdAt', 'DESC']] });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchGroups = async (req, res) => {
  try {
    const q = req.query.q || '';
    const groups = await Group.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { course: { [Op.like]: `%${q}%` } },
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

exports.joinGroup = async (req, res) => {
  try {
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
const GroupMember = require('../models/GroupMember');

exports.getGroups = async (req, res) => {
  const groups = await Group.findAll();

  const result = await Promise.all(groups.map(async group => {
    const count = await GroupMember.count({
      where: { groupId: group.id }
    });

    return { ...group.toJSON(), members: count };
  }));

  res.json(result);
};