const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
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