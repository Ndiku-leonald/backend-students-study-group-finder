const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: DataTypes.STRING,
  program: DataTypes.STRING,
  year: DataTypes.INTEGER,
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'student'
  }
});

module.exports = User;