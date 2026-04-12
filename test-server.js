const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.post('/api/auth/register', (req, res) => {
  console.log('Registration request:', req.body);
  res.json({ message: 'Test registration endpoint working', data: req.body });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});