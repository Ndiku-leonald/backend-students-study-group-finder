const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  groupId: DataTypes.INTEGER.UNSIGNED,
  date: DataTypes.DATE,
  time: DataTypes.STRING,
  location: DataTypes.STRING,
  description: DataTypes.TEXT
}, {
  tableName: 'Sessions'
});

module.exports = Session;