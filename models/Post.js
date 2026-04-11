const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Post = sequelize.define('Post', {
  groupId: DataTypes.INTEGER,
  userId: DataTypes.INTEGER,
  content: DataTypes.TEXT
});

module.exports = Post;