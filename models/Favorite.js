const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Favorites let a student bookmark a group for later access.
// This table stays intentionally small because it only needs the relationship IDs.
const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  // Each favorite links one user to one group.
  userId: DataTypes.INTEGER.UNSIGNED,
  groupId: DataTypes.INTEGER.UNSIGNED
}, {
  tableName: 'Favorites'
});

module.exports = Favorite;