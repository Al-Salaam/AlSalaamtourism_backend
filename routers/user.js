const express = require('express');

const passport = require("passport");
const { getMyProfile, logout, registeration, login } = require('../controllers/user');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.route('/auth/register').post(registeration);
router.post('/auth/login', passport.authenticate('local'), login);
router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile"]
}))

router.get("/auth/google/callback", passport.authenticate("google", {
    scope:["profile"],
    successRedirect: process.env.FRONTEND_URL,
}))

router.route('/me').get(isAuthenticated, getMyProfile);
router.route('/logout').get(logout);

module.exports = router;