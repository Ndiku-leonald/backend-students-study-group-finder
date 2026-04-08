const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');

exports.createGroup = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    
    const group = await Group.create({
      name: req.body.name,
      description: req.body.description,
      userId: req.user.id
    });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};