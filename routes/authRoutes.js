const express = require('express');
const router = express.Router();
const { register, login, getUsers } = require('../controllers/authControllers');
const auth = require('../middleware/authMiddleware');

// Keep role-specific endpoints thin by reusing the same controller functions.
const registerAs = (role) => (req, res) => {
	req.body.role = role;
	return register(req, res);
};

const loginAs = (role) => (req, res) => {
	req.body.role = role;
	return login(req, res);
};

router.post('/student/register', registerAs('student'));
router.post('/admin/register', registerAs('admin'));
router.post('/student/login', loginAs('student'));
router.post('/admin/login', loginAs('admin'));
router.post('/login', login);
router.post('/register', register);
router.get('/users', auth, getUsers);

module.exports = router;