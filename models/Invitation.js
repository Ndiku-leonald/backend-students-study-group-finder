const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invitation = sequelize.define('Invitation', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  groupId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  inviterId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  inviteeId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  tableName: 'Invitations'
});

module.exports = Invitation;