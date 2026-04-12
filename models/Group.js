const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
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