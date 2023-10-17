const express = require('express');
const { contactus } = require('../controllers/contact');

const router = express.Router();


router.route('/contact').post(contactus);
module.exports = router;