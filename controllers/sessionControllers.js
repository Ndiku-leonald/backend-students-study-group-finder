const Session = require('../models/Session');

exports.createSession = async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};