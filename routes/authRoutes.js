const express = require('express');
const router = express.Router();
const { register, login, getUsers } = require('../controllers/authControllers');
const auth = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/users', auth, getUsers);

module.exports = router;