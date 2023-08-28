const express = require("express");
const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlist");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();
router.route('/wishlist/add-to-wishlist').post(isAuthenticated,addToWishlist)
router.route('/wishlist').get(isAuthenticated, getWishlist)
router.route('/wishlist/remove-from-wishlist').delete(isAuthenticated, removeFromWishlist);

module.exports = router;
