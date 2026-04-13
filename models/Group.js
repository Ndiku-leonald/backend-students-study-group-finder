const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Represents a study group created by a student or administrator.
// The userId column points to the leader who owns and manages the group.
const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  // These descriptive fields power the group cards and detail pages.
  name: DataTypes.STRING,
  course: DataTypes.STRING,
  faculty: DataTypes.STRING,
  description: DataTypes.TEXT,
  location: DataTypes.STRING,
  userId: DataTypes.INTEGER.UNSIGNED
}, {
  tableName: 'Groups'
});

module.exports = Group;