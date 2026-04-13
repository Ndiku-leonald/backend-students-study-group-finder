const Session = require('../models/session');
const Group = require('../models/Group');

// A session can only be scheduled by the group leader.
const isGroupLeader = (group, userId) => group.userId === userId;

exports.createSession = async (req, res) => {
  try {
    // Sessions are created from the group calendar form.
    // The group ID connects the session directly back to the relevant study group.
    const { groupId, date, time, location, description } = req.body;

    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!isGroupLeader(group, req.user.id)) {
      return res.status(403).json({ message: 'Only the group leader can create study sessions' });
    }

    // The session record is intentionally lightweight: the UI displays the important details.
    const session = await Session.create({ groupId, date, time, location, description });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};