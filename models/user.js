const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
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
  },
  adminCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  }
}, {
  tableName: 'Users'
});

module.exports = User;