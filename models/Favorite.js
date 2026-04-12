const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  userId: DataTypes.INTEGER.UNSIGNED,
  groupId: DataTypes.INTEGER.UNSIGNED
}, {
  tableName: 'Favorites'
});

module.exports = Favorite;