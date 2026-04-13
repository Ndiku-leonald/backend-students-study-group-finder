const { Sequelize } = require('sequelize');

// This file creates the single Sequelize connection used everywhere in the backend.
// All models import this same instance so they talk to the same MySQL database.
const sequelize = new Sequelize(
  process.env.DB_NAME || 'study_group_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    // The database connection is driven by environment variables so the app can
    // run locally, in testing, or in deployment without code changes.
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;