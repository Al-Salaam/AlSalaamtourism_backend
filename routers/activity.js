const express = require('express');
const { createActivity, getAllActivities, getActivityById, updateActivityById, deleteActivityById, createActivityReview, getAllRevirews } = require('../controllers/activity');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.route('/activity').post(createActivity)
.get(getAllActivities)

router.route('/:id').get(getActivityById).put(updateActivityById).delete(deleteActivityById)

router.route('/activity/review').put(isAuthenticated, createActivityReview);
router.route('/activity/reviews').get(getAllRevirews)

module.exports = router;