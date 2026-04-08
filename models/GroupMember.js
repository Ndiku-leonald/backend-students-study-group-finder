const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Group = sequelize.define('Group', {
  name: DataTypes.STRING,
  course: DataTypes.STRING,
  description: DataTypes.TEXT,
  location: DataTypes.STRING,
  userId: DataTypes.INTEGER
});

module.exports = Group;