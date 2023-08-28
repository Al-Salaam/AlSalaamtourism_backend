const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { createInquiry } = require("../controllers/inquiry");
const router = express.Router();


router.route('/packages/:packageId/inquiry').post(isAuthenticated, createInquiry);

module.exports = router;