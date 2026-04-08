const { Op } = require('sequelize');
const Group = require('../models/Group');

exports.searchGroups = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'query parameter is required' });
    }

    const groups = await Group.findAll({
      where: {
        name: { [Op.like]: `%${query}%` }
      }
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};