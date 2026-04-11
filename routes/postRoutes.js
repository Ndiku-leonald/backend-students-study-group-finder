const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createPost } = require('../controllers/postController');

router.post('/:groupId', auth, createPost);

module.exports = router;