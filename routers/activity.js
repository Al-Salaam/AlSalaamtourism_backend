const express = require('express');
const { createActivity, getAllActivities, getActivityById, updateActivityById, deleteActivityById, createActivityReview, getAllRevirews, deleteActivityReview } = require('../controllers/activity');
const { isAuthenticated, authorizeRole } = require('../middlewares/auth');
const multipleUpload = require('../middlewares/multer');
const { addToWishList, removeFromWishlist } = require('../controllers/wishlist');

const router = express.Router();

router.route('/activity')
.post(isAuthenticated, authorizeRole(['admin']), multipleUpload, createActivity)
.get(getAllActivities);

router.route('/activity/:id')
.get(getActivityById)
.put(isAuthenticated, authorizeRole(['admin']), multipleUpload, updateActivityById)
.delete(isAuthenticated, authorizeRole(['admin']), multipleUpload,deleteActivityById);

router.route('/activity/:id/review').put(isAuthenticated, createActivityReview);
router.route('/activity/:activityId/reviews')
.get(getAllRevirews);

router.route('/activity/:activityId/reviews/:reviewId')
.delete(isAuthenticated, deleteActivityReview);

module.exports = router;