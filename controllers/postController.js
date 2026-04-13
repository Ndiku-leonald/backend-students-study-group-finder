const Post = require('../models/Post');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/user');

exports.createPost = async (req, res) => {
  try {
    // Posts are stored as simple group messages.
    // The author is taken from the authenticated user, not from request input.
    const post = await Post.create({
      content: req.body.content,
      groupId: req.params.groupId,
      userId: req.user.id
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupPosts = async (req, res) => {
  try {
    // Gate post visibility behind membership checks.
    // This keeps group discussions private to the people who actually joined.
    const group = await Group.findByPk(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.userId === req.user.id;
    const membership = await GroupMember.findOne({
      where: {
        groupId: group.id,
        userId: req.user.id
      }
    });

    if (!isMember && !membership) {
      return res.status(403).json({ message: 'You must be a group member to view posts' });
    }

    const posts = await Post.findAll({
      where: { groupId: req.params.groupId },
      include: [{ model: User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};