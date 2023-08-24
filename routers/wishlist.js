const express = require("express");
const { getWishlist } = require("../controllers/wishlist");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router.route('/wishlist').get(isAuthenticated, getWishlist)

module.exports = router;
