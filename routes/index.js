const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send("Main API route working");
});

module.exports = router;