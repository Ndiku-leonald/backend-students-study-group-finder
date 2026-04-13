const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createPost, getGroupPosts, getGroupFiles, uploadGroupFile } = require('../controllers/postController');

router.get('/:groupId', auth, getGroupPosts);
router.post('/:groupId', auth, createPost);
router.get('/:groupId/files', auth, getGroupFiles);
router.post('/:groupId/files', auth, upload.single('file'), uploadGroupFile);

module.exports = router;