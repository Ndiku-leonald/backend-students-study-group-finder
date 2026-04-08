const { Op } = require('sequelize');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');

exports.searchGroups = async (req, res) => {
  try {
    const group = await Group.create({
      ...req.body,
      userId: req.user.id
    });

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};