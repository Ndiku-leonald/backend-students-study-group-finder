const Session = require('../models/session');
const Group = require('../models/Group');

const isGroupLeader = (group, userId) => group.userId === userId;

exports.createSession = async (req, res) => {
  try {
    const { groupId, date, time, location } = req.body;
    const description = req.body.description ?? req.body.agenda;

    if (!groupId || !date || !time || !location) {
      return res.status(400).json({ message: 'groupId, date, time, and location are required' });
    }

    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!isGroupLeader(group, req.user.id)) {
      return res.status(403).json({ message: 'Only the group leader can create study sessions' });
    }

    const session = await Session.create({ groupId, date, time, location, description });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};