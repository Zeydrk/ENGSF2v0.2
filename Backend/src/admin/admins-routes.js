const express = require('express');
const router = express.Router();
const controller = require('./admins-controller');
const passport = require('./middleware/admin-middleware.js');
const registerMiddleware = require("./middleware/register-middleware.js")

// Routes
router.post('/', registerMiddleware ,controller.createAdmin);

// Changed to post because we are sending username and password in the body
router.post('/login',passport.authenticate('local'),controller.getAdmins);
router.post('/logout', controller.logoutAdmin);
// forgot password emailers
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password/', controller.resetPassword);

module.exports = router;