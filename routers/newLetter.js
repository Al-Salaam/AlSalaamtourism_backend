const express = require('express');
const { createNewsLetter } = require('../controllers/newsLetter');
const router = express.Router();

router.route('/subscribe').post(createNewsLetter);

module.exports = router;