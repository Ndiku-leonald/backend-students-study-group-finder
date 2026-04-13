const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Stores both student and admin accounts in a single table.
// The role column is what lets the app branch into student and admin behavior.
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  // Basic identity and login fields.
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: DataTypes.STRING,
  // Student profile data is only populated for student accounts.
  program: DataTypes.STRING,
  year: DataTypes.INTEGER,
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'student'
  },
  // Admin accounts receive a generated code so they can be identified later.
  adminCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  }
}, {
  tableName: 'Users'
});

module.exports = User;