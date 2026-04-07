const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/login', login);
const authController = require('../controllers/authController');

router.post('/register', authController.register);


module.exports = router;