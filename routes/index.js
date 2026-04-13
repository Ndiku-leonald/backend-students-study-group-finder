const express = require('express');
const { test } = require('../controllers/testControllers');

const router = express.Router();

// Basic health endpoint for quick smoke checks.
router.get('/test', test);

// Fallback root route for manual verification in the browser.
router.get('/', (req, res) => {
  res.send("Main API route working");
});

module.exports = router;