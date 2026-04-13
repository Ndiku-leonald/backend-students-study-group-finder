const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Admin access codes gate admin self-registration.
// Keeping them in a separate table makes it easy to seed and rotate codes.
const AdminAccessCode = sequelize.define('AdminAccessCode', {
  code: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  // When inactive, a code should no longer be accepted during registration.
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'AdminAccessCodes'
});

module.exports = AdminAccessCode;