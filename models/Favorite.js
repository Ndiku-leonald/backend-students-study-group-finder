const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Favorite = sequelize.define('Favorite', {
  userId: DataTypes.INTEGER,
  groupId: DataTypes.INTEGER
});

module.exports = Favorite;