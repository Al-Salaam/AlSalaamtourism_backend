const express = require('express');
const { isAuthenticated, authorizeRole } = require('../middlewares/auth');
const { createBooking, getAllBookingsForUser, updateBookingStatus, deleteBooking } = require('../controllers/booking');

const router = express.Router();

router.route('/bookings').post(isAuthenticated, createBooking);
router.route('/bookings/user').get(isAuthenticated, getAllBookingsForUser);
router.route('/bookings/:id/status').put(isAuthenticated, authorizeRole(['admin']), updateBookingStatus);
router.route('/bookings/:id').delete(isAuthenticated, authorizeRole(['admin']), deleteBooking)

module.exports = router;