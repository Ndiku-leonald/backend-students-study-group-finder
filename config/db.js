const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('study_group_db', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;