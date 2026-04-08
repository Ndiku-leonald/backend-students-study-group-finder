const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authControllers');

router.post('/login', login);
const authController = require('../controllers/authControllers');

router.post('/register', authController.register);


module.exports = router;