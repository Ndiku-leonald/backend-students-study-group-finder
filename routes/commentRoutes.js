const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getPostComments, createComment } = require('../controllers/commentController');

router.get('/post/:postId', auth, getPostComments);
router.post('/post/:postId', auth, createComment);

module.exports = router;
