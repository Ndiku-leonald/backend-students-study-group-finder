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
app.use('/dashboard', dashboardRoutes);
app.use('/invitations', invitationRoutes);

app.get('/', (req, res) => {
  res.send("API is running");
});

app.use('/', routes);

sequelize
  .authenticate()
  .then(() => {
    console.log('MySQL connected');
    return sequelize.sync({ force: false }); // Create tables if they don't exist
  })
  .then(() => {
    console.log('Database synchronized');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  });