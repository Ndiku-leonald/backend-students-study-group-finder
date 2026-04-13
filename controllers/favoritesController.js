const Favorite = require('../models/Favorite');
const Group = require('../models/Group');

exports.addFavorite = async (req, res) => {
  try {
    const [fav] = await Favorite.findOrCreate({
      where: {
        userId: req.user.id,
        groupId: req.params.groupId
      },
      defaults: {
        userId: req.user.id,
        groupId: req.params.groupId
      }
    });

    res.json(fav);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Group }],
      order: [['createdAt', 'DESC']]
    });

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const deleted = await Favorite.destroy({
      where: {
        userId: req.user.id,
        groupId: req.params.groupId
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Favorite removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
