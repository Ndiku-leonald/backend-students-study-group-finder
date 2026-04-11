const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addFavorite } = require('../controllers/favoritesController');

router.post('/:groupId', auth, addFavorite);

module.exports = router;
