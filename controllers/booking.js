
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Activity = require('../models/Activity');
const Booking = require("../models/Booking");

const stripe = require('stripe')('sk_test_51NiXsqLx7xThqHSA0MtfpGnKjh9pB38YAXRXEGkDpszQRwYehYIlkPxGuwi2Q8gTRx1Bqb63pvwbkbovbSGFRuTS00GFXNrMO3');


exports.createBooking = async (req, res, next) => {
    const {
        activityId,
        date,
        adults,
        children,
        infants,
        totalAmount,
        paymentStatus
    } = req.body;


    const userId = req.user._id; // Assuming user is authenticated
    try {
        // Fetch activity details
        const activity = await Activity.findById(activityId);

        // Check if activity is not found
        if (!activity) {
            return res.status(404).json({
                status: 'error',
                message: 'Activity not found'
            });
        }

        // Convert totalAmount to cents (Stripe's expected format)
        const totalAmountCents = totalAmount * 100;

        // Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'aed', // Change to 'aed' for Dirham
                        unit_amount: totalAmountCents,
                        product_data: {
                            name: activity.name,
                            images: [activity.images[0].url],
                            description: activity.shortdescription,
                            metadata: {
                                id: activity._id
                            }
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_CONSUMER_URL}/success`, // Customize this URL
            cancel_url: `${process.env.FRONTEND_CONSUMER_URL}/cancel`, // Customize this URL
        });

        // Create the booking in your database
        const booking = await Booking.create({
            activity: activity._id,
            user: userId,
            date,
            adults,
            children,
            infants,
            totalAmount: totalAmountCents / 100, // Store totalAmount in the original format
            paymentStatus,
            stripeCheckoutSessionId: session.url, // Save Stripe Session URL
        });

        res.status(201).json({
            status: 'success',
            data: {
                booking,
                stripeCheckoutSessionUrl: session.url, // Pass this to the frontend
            },
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while creating the booking',
        });
    }
};




exports.getAllBookingsForUser = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id; // Assuming user is authenticated

    const bookings = await Booking.find({ user: userId }).populate('activity').populate('user');

    res.status(200).json({
        success: true,
        data: {
            bookings
        }
    });
});

exports.getAllbookingsforAdmin = catchAsyncError(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1; // Current page number (default to 1 if not specified)
    const limit = parseInt(req.query.limit) || 8; // Number of activities per page (default to 10 if not specified)
    // Calculate the number of documents to skip based on the page number and limit
    const skip = (page - 1) * limit;
    const totalBookings = await Booking.countDocuments();
    const totalPages = Math.ceil(totalBookings / limit);
    const bookings = await Booking.find().populate('activity').populate('user').skip(skip)
        .limit(limit);
    res.status(200).json({
        success: true,
        data: {
            bookings,
            page,
            totalBookings,
            totalPages
        }
    })
})

// exports.updateBookingStatus = catchAsyncError(async (req, res, next) => {
//     const bookingId = req.params.id;
//     const { paymentStatus } = req.body;

//     const booking = await Booking.findByIdAndUpdate(
//         bookingId,
//         { paymentStatus },
//         { new: true }
//     );

//     if (!booking) {
//         return res.status(404).json({
//             status: 'error',
//             message: 'Booking not found'
//         });
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             booking
//         }
//     });
// });

exports.updateBookingStatus = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const booking = await Booking.findByIdAndUpdate(
        id,
        { paymentStatus },
        { new: true }
    );

    if (!booking) {
        return res.status(404).json({
            status: 'error',
            message: 'Booking not found'
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'Status Successfully Updated',

    });
});

exports.deleteBooking = catchAsyncError(async (req, res, next) => {
    const bookingId = req.params.id;

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
        return res.status(404).json({
            status: 'error',
            message: 'Booking not found'
        });
    }

    res.status(200).json({
        status: 'success',
        message: 'Deleted Successfully'
    });
});
