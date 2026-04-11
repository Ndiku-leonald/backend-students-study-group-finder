const express = require('express');
const routes = require('./routes');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const postRoutes = require('./routes/postRoutes');
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);
app.use('/sessions', sessionRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
  res.send("API is running");
});

app.use('/', routes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));