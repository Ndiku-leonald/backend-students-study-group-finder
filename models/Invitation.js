const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Invitation rows keep track of pending, accepted, and rejected requests.
// The status field lets the frontend show exactly where each invite is in the flow.
const Invitation = sequelize.define('Invitation', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  // These foreign keys identify the group, the sender, and the recipient.
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