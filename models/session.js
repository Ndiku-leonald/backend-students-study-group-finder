const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Session = sequelize.define('Session', {
  groupId: DataTypes.INTEGER,
  date: DataTypes.DATE,
  time: DataTypes.STRING,
  location: DataTypes.STRING,
  description: DataTypes.TEXT
});

module.exports = Session;