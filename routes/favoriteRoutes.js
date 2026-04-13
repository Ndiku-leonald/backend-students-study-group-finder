const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addFavorite, getMyFavorites, removeFavorite } = require('../controllers/favoritesController');

router.get('/', auth, getMyFavorites);
router.post('/:groupId', auth, addFavorite);
router.delete('/:groupId', auth, removeFavorite);

module.exports = router;
