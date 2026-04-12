const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
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