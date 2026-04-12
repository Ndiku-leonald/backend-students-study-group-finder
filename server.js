const express = require('express');
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes');
const sequelize = require('./config/db');
require('./models'); // Load models and associations
const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const postRoutes = require('./routes/postRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const userRoutes = require('./routes/userRoutes');

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/posts', postRoutes);
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