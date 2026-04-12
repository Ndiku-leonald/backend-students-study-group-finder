const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  groupId: DataTypes.INTEGER.UNSIGNED,
  userId: DataTypes.INTEGER.UNSIGNED,
  content: DataTypes.TEXT
}, {
  tableName: 'Posts'
});

module.exports = Post;