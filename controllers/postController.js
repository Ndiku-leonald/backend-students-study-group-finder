const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
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