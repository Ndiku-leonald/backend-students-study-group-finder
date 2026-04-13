const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/user');

exports.getPostComments = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const group = await Group.findByPk(post.groupId);
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

    if (req.user.role !== 'admin' && !isMember && !membership) {
      return res.status(403).json({ message: 'You must be a group member to view comments' });
    }

    const comments = await Comment.findAll({
      where: { postId: post.id },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const group = await Group.findByPk(post.groupId);
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

    if (req.user.role !== 'admin' && !isMember && !membership) {
      return res.status(403).json({ message: 'You must be a group member to comment' });
    }

    const content = (req.body.content || '').trim();
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const comment = await Comment.create({
      postId: post.id,
      userId: req.user.id,
      content
    });

    const created = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
