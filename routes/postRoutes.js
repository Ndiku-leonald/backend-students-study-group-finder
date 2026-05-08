const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const auth = require('../middleware/authMiddleware');
const { createPost, getGroupPosts, uploadGroupFile, getGroupFiles } = require('../controllers/postController');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'group-files');
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		fs.mkdirSync(uploadDirectory, { recursive: true });
		cb(null, uploadDirectory);
	},
	filename: (req, file, cb) => {
		const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
		cb(null, `${Date.now()}-${safeName}`);
	}
});

const upload = multer({ storage });

// Posts double as chat messages for a group.
router.get('/:groupId', auth, getGroupPosts);
router.post('/:groupId', auth, createPost);
router.get('/:groupId/files', auth, getGroupFiles);
router.post('/:groupId/files', auth, upload.single('file'), uploadGroupFile);

module.exports = router;