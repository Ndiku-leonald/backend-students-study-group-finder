const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invitation = sequelize.define('Invitation', {
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inviterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inviteeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  }
});

module.exports = Invitation;