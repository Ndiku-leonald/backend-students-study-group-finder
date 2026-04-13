const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Group posts are used as the lightweight discussion feed.
// The content field stores the actual message shown inside a group thread.
const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  // Posts are scoped to a group and attributed to the author.
  groupId: DataTypes.INTEGER.UNSIGNED,
  userId: DataTypes.INTEGER.UNSIGNED,
  content: DataTypes.TEXT
}, {
  tableName: 'Posts'
});

module.exports = Post;