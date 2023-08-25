const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const { createPakage, updatePakageById, deletePakageById, createPakageReview, deletePakageReview, getAllPakages, getPakageById, getAllPakageReviews } = require('../controllers/pakage');



// Pakage Routes
router.route('/pakages')
    .post(createPakage)
    .get(getAllPakages);

router.route('/pakages/:id')
    .get(getPakageById)
    .put(updatePakageById)
    .delete(deletePakageById);

// Pakage Review Routes
router.route('/pakages/:id/reviews')
    .post(isAuthenticated, createPakageReview)
    .get(getAllPakageReviews);

router.route('/pakages/:pakageId/reviews/:reviewId')
    .delete(isAuthenticated, deletePakageReview);

// ...

module.exports = router;
