const Post = require('../models/Post');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/user');

const FILE_POST_PREFIX = 'FILE::';

const parseFilePostContent = (content) => {
  if (typeof content !== 'string' || !content.startsWith(FILE_POST_PREFIX)) {
    return null;
  }

  try {
    return JSON.parse(content.slice(FILE_POST_PREFIX.length));
  } catch (error) {
    return null;
  }
};

const ensureGroupAccess = async (groupId, userId) => {
  const group = await Group.findByPk(groupId);

  if (!group) {
    return { ok: false, status: 404, message: 'Group not found' };
  }

  const isLeader = group.userId === userId;
  const membership = await GroupMember.findOne({
    where: {
      groupId: group.id,
      userId
    }
  });

  if (!isLeader && !membership) {
    return { ok: false, status: 403, message: 'You must be a group member to access this group' };
  }

  return { ok: true, group };
};

exports.createPost = async (req, res) => {
  try {
    const access = await ensureGroupAccess(req.params.groupId, req.user.id);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

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
    const access = await ensureGroupAccess(req.params.groupId, req.user.id);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const posts = await Post.findAll({
      where: { groupId: req.params.groupId },
      include: [{ model: User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    // File uploads are represented by metadata posts and should be hidden from plain chat feed.
    const messagesOnly = posts.filter((post) => !parseFilePostContent(post.content));

    res.json(messagesOnly);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupFiles = async (req, res) => {
  try {
    const access = await ensureGroupAccess(req.params.groupId, req.user.id);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const posts = await Post.findAll({
      where: { groupId: req.params.groupId },
      include: [{ model: User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    const files = posts
      .map((post) => {
        const fileMeta = parseFilePostContent(post.content);
        if (!fileMeta) {
          return null;
        }

        return {
          id: post.id,
          originalName: fileMeta.originalName,
          fileUrl: fileMeta.fileUrl,
          mimeType: fileMeta.mimeType,
          size: fileMeta.size,
          createdAt: post.createdAt,
          User: post.User
        };
      })
      .filter(Boolean);

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadGroupFile = async (req, res) => {
  try {
    const access = await ensureGroupAccess(req.params.groupId, req.user.id);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileMeta = {
      originalName: req.file.originalname,
      fileUrl: `/uploads/group-files/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size
    };

    const post = await Post.create({
      content: `${FILE_POST_PREFIX}${JSON.stringify(fileMeta)}`,
      groupId: req.params.groupId,
      userId: req.user.id
    });

    res.status(201).json({
      id: post.id,
      ...fileMeta
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};