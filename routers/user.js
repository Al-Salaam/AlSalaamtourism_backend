const express = require('express');

const passport = require("passport");
const { getMyProfile, logout, registeration, login, adminLogin, getAllUsers, changePassword } = require('../controllers/user');
const { isAuthenticated, authorizeRole } = require('../middlewares/auth');

const router = express.Router();

router.route('/auth/register').post(registeration);
router.post('/auth/login', passport.authenticate('local'), login);
router.post('/auth/admin-login', passport.authenticate('local'), adminLogin);
router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile"]
}))

router.get("/auth/google/callback", passport.authenticate("google", {
    scope:["profile"],
    successRedirect: process.env.FRONTEND_URL,
}))

router.route('/me').get(isAuthenticated, getMyProfile);
router.route('/admin/users').get(isAuthenticated, authorizeRole('admin'), getAllUsers);
// router.route('/auth/change-password').put(isAuthenticated, changePassword);
router.route('/logout').get(logout);

module.exports = router;