const Favorite = require('../models/Favorite');

exports.addFavorite = async (req, res) => {
  try {
    // Store a user-group favorite pair for quick access later.
    // The app can use this to surface bookmarked groups on a dashboard or profile page.
    const fav = await Favorite.create({
      userId: req.user.id,
      groupId: req.params.groupId
    });
    res.json(fav);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
