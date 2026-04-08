const express = require('express');
const { test } = require('../controllers/testControllers');

const router = express.Router();

router.get('/test', test);

router.get('/', (req, res) => {
  res.send("Main API route working");
});

module.exports = router;