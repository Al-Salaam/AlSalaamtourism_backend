const express = require('express');

const passport = require("passport");
const { getMyProfile, logout } = require('../controllers/user');

const router = express.Router();

router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile"]
}))

router.get("/auth/google/callback", passport.authenticate("google", {
    scope:["profile"],
    successRedirect: process.env.FRONTEND_URL,
}))

router.route('/me').get(getMyProfile);
router.route('/logout').get(logout);

module.exports = router;