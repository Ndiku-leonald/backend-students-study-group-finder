const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Join table that tracks which users belong to which groups.
// This is the source of truth for membership-based permissions.
const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  // Together, these columns form the group membership link.
  groupId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'GroupMembers'
});

module.exports = GroupMember;