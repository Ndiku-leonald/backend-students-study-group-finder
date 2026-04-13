const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
const env = require('./config/env');
const routes = require('./routes');
const sequelize = require('./config/db');
require('./models'); // Load models and associations
const app = express();
const PORT = env.PORT;
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const userRoutes = require('./routes/userRoutes');

const allowedOrigins = (env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '200kb' }));
app.use(rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
}));
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/invites', invitationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/invites', invitationRoutes);

app.get('/', (req, res) => {
  res.send("API is running");
});

app.use('/', routes);

sequelize
  .authenticate()
  .then(() => {
    console.log('MySQL connected');
  })
  .then(async () => {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS GroupMembers (
        id INT NOT NULL AUTO_INCREMENT,
        groupId INT NOT NULL,
        userId INT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_group_members_user_group (groupId, userId)
      ) ENGINE=InnoDB;
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Favorites (
        id INT NOT NULL AUTO_INCREMENT,
        userId INT NOT NULL,
        groupId INT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_favorites_user_group (userId, groupId)
      ) ENGINE=InnoDB;
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Posts (
        id INT NOT NULL AUTO_INCREMENT,
        groupId INT NOT NULL,
        userId INT NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS Comments (
        id INT NOT NULL AUTO_INCREMENT,
        postId INT NOT NULL,
        userId INT NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS FileShares (
        id INT NOT NULL AUTO_INCREMENT,
        groupId INT NOT NULL,
        userId INT NOT NULL,
        originalName VARCHAR(255) NOT NULL,
        storedName VARCHAR(255) NOT NULL,
        mimeType VARCHAR(255) NOT NULL,
        size INT NOT NULL,
        fileUrl VARCHAR(255) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS AdminAccessCodes (
        code VARCHAR(10) NOT NULL,
        isActive TINYINT(1) NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (code)
      ) ENGINE=InnoDB;
    `);

    const seedCodes = Array.from({ length: 50 }, (_, index) => {
      const codeNumber = String(index + 1).padStart(2, '0');
      return `('${`x${codeNumber}`}', 1)`;
    }).join(', ');

    await sequelize.query(`
      INSERT IGNORE INTO AdminAccessCodes (code, isActive)
      VALUES ${seedCodes};
    `);
  })
  .then(() => {
    console.log('Database ready');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  });