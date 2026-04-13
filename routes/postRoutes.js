const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createPost, getGroupPosts } = require('../controllers/postController');

// Posts double as chat messages for a group.
router.get('/:groupId', auth, getGroupPosts);
router.post('/:groupId', auth, createPost);

module.exports = router;