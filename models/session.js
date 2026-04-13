const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Study sessions belong to one group and are ordered by date/time.
// The frontend uses this table to show the upcoming study schedule.
const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  // Every session belongs to exactly one study group.
  groupId: DataTypes.INTEGER.UNSIGNED,
  date: DataTypes.DATE,
  time: DataTypes.STRING,
  location: DataTypes.STRING,
  description: DataTypes.TEXT
}, {
  tableName: 'Sessions'
});

module.exports = Session;