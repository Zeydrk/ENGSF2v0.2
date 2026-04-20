// routes/adminLogRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('./adminlogs-controller');

// Get admin activity logs with filters
router.get('/', controller.getAdminLogs);

// Get admins for filter dropdown
router.get('/loggedadmin', controller.getAdminsForFilter);

module.exports = router;