const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const routes = require('./routes');
const sequelize = require('./config/db');
// Importing the models index registers every model and relationship before the
// app starts serving requests. That ensures Sequelize knows the full schema.
require('./models');
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

// Restrict CORS to the configured frontend origins when they are provided.
// This allows the React app to call the API while keeping browser access controlled.
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
// JSON parsing must run before the API routes so controllers can read request bodies.
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route mounting keeps each domain isolated: auth, groups, sessions, posts,
// favorites, dashboard data, invitations, and user operations all live in their own module.
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

// Keep the root router mounted for test and fallback routes.
app.use('/', routes);

// Bring the database online before starting the HTTP server.
// The sequence is: authenticate the DB connection, sync models into tables,
// seed admin access codes, then start listening on the port.
sequelize
  .authenticate()
  .then(() => {
    console.log('MySQL connected');
  })
  .then(async () => {
    // Create any missing tables from the current model definitions.
    await sequelize.sync();

    // Seed a predictable pool of admin codes for registration.
    // These codes are used by the admin registration flow to prevent open signup.
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