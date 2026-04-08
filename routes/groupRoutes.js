const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createGroup } = require('../controllers/groupController');
const { getGroups, searchGroups, joinGroup } = require('../controllers/groupController');

router.get('/', getGroups);
router.get('/search', searchGroups);
router.post('/join/:groupId', auth, joinGroup);
router.post('/create', auth, createGroup);

module.exports = router;