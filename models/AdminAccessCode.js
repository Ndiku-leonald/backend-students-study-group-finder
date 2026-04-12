const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AdminAccessCode = sequelize.define('AdminAccessCode', {
  code: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'AdminAccessCodes'
});

module.exports = AdminAccessCode;