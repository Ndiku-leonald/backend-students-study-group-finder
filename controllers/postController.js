const Post = require('../models/Post');
const Comment = require('../models/Comment');
const FileShare = require('../models/FileShare');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/user');

exports.createPost = async (req, res) => {
  try {
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

    if (req.user.role !== 'admin' && !isMember && !membership) {
      return res.status(403).json({ message: 'You must be a group member to post messages' });
    }

    const content = (req.body.content || '').trim();
    if (!content) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    const post = await Post.create({
      content,
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

    if (req.user.role !== 'admin' && !isMember && !membership) {
      return res.status(403).json({ message: 'You must be a group member to view posts' });
    }

    const posts = await Post.findAll({
      where: { groupId: req.params.groupId },
      include: [
        { model: User, attributes: ['id', 'name'] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'name'] }],
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupFiles = async (req, res) => {
  try {
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

    if (req.user.role !== 'admin' && !isMember && !membership) {
      return res.status(403).json({ message: 'You must be a group member to view files' });
    }

    const files = await FileShare.findAll({
      where: { groupId: group.id },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadGroupFile = async (req, res) => {
  try {
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

    if (req.user.role !== 'admin' && !isMember && !membership) {
      return res.status(403).json({ message: 'You must be a group member to upload files' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const fileShare = await FileShare.create({
      groupId: group.id,
      userId: req.user.id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      fileUrl: `/uploads/group-files/${req.file.filename}`
    });

    const created = await FileShare.findByPk(fileShare.id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};