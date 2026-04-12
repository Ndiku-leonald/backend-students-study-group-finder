const User = require('./user');
const Group = require('./Group');
const Session = require('./session');
const Favorite = require('./Favorite');
const Post = require('./Post');
const GroupMember = require('./GroupMember');
const Invitation = require('./Invitation');
const AdminAccessCode = require('./AdminAccessCode');

// Associations
User.hasMany(Group, { foreignKey: 'userId' });
Group.belongsTo(User, { foreignKey: 'userId', as: 'Leader' });

Group.hasMany(Session, { foreignKey: 'groupId' });
Session.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(Favorite, { foreignKey: 'userId' });
Group.hasMany(Favorite, { foreignKey: 'groupId' });
Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(Group, { foreignKey: 'groupId' });

Group.hasMany(Post, { foreignKey: 'groupId' });
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(Group, { foreignKey: 'groupId' });
Post.belongsTo(User, { foreignKey: 'userId' });

Group.hasMany(GroupMember, { foreignKey: 'groupId' });
User.hasMany(GroupMember, { foreignKey: 'userId' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });
GroupMember.belongsTo(User, { foreignKey: 'userId' });

Group.hasMany(Invitation, { foreignKey: 'groupId' });
Invitation.belongsTo(Group, { foreignKey: 'groupId' });
User.hasMany(Invitation, { as: 'SentInvitations', foreignKey: 'inviterId' });
User.hasMany(Invitation, { as: 'ReceivedInvitations', foreignKey: 'inviteeId' });
Invitation.belongsTo(User, { as: 'Inviter', foreignKey: 'inviterId' });
Invitation.belongsTo(User, { as: 'Invitee', foreignKey: 'inviteeId' });

module.exports = {
  User,
  Group,
  Session,
  Favorite,
  Post,
  GroupMember,
  Invitation,
  AdminAccessCode
};