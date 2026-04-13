const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { getStudentDashboard, getAdminDashboard } = require('../controllers/dashboardController');

// Student and admin dashboards share the same router namespace.
router.get('/me', auth, getStudentDashboard);
router.get('/admin', auth, admin, getAdminDashboard);

module.exports = router;