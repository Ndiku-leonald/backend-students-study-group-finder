const Favorite = require('../models/Favorite');

exports.addFavorite = async (req, res) => {
  try {
    const fav = await Favorite.create({
      userId: req.user.id,
      groupId: req.params.groupId
    });
    res.json(fav);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
