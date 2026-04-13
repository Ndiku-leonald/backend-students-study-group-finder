const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addFavorite } = require('../controllers/favoritesController');

// Mark a group as a favorite for the signed-in user.
router.post('/:groupId', auth, addFavorite);

module.exports = router;
