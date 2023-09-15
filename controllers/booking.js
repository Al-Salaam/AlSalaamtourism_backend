const stripe = require("../config/stripe");
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Activity = require("../models/Activity");
const Booking = require("../models/Booking");


exports.createBooking = catchAsyncError(async (req, res, next) => {
    const {
        activityId,
        date,
        adults,
        children = 0,
        infants = 0,
        totalAmount,
        paymentStatus = 'pending'
    } = req.body;

    const userId = req.user._id; // Assuming user is authenticated

    
        // Fetch activity details
        const activity = await Activity.findById(activityId);

        if (!activity) {
            return res.status(404).json({
                status: 'error',
                message: 'Activity not found'
            });
        }

        // Create a Stripe Payment Intent
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: totalAmount * 100, // Stripe expects amount in cents
        //     currency: 'usd', // Change to your desired currency
        //     description: 'Booking payment',
        // });

        // Create the booking in your database
        const booking = await Booking.create({
            activity: activityId,
            user: userId,
            date,
            adults,
            children,
            infants,
            totalAmount,
            paymentStatus,
            // paymentIntentId: paymentIntent.id, // Save Stripe Payment Intent ID
        });

        res.status(201).json({
            status: 'success',
            data: {
                booking,
                // clientSecret: paymentIntent.client_secret, // Pass this to the frontend
            }
        });
   
});


// exports.createBooking = catchAsyncError(async (req, res, next) => {
//     const {
//         activityId,
//         date,
//         adults,
//         children = 0,
//         infants = 0,
//         totalAmount,
//         paymentStatus = 'pending'
//     } = req.body;

//     const userId = req.user._id; // Assuming user is authenticated

//     try {
//         // Fetch activity details
//         const activity = await Activity.findById(activityId);

//         if (!activity) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Activity not found'
//             });
//         }

//         // Create a Stripe Checkout Session
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: [
//                 {
//                     price_data: {
//                         currency: 'usd', // Change to your desired currency
//                         unit_amount: totalAmount * 100, // Stripe expects amount in cents
//                         product_data: {
//                             name: activity.name, // Name of the activity
//                         },
//                     },
//                     quantity: 1,
//                 },
//             ],
//             mode: 'payment',
//             success_url: 'https://yourwebsite.com/success', // Customize this URL
//             cancel_url: 'https://yourwebsite.com/cancel', // Customize this URL
//         });

//         // Create the booking in your database
//         const booking = await Booking.create({
//             activity: activityId,
//             user: userId,
//             date,
//             adults,
//             children,
//             infants,
//             totalAmount,
//             paymentStatus,
//             stripeCheckoutSessionId: session.id, // Save Stripe Session ID
//         });

//         res.status(201).json({
//             status: 'success',
//             data: {
//                 booking,
//                 stripeCheckoutSessionId: session.id, // Pass this to the frontend
//             },
//         });
//     } catch (error) {
//         console.error('Error creating booking:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'An error occurred while creating the booking',
//         });
//     }
// });


exports.getAllBookingsForUser = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id; // Assuming user is authenticated

    const bookings = await Booking.find({ user: userId }).populate('activity').populate('user');

    res.status(200).json({
        status: 'success',
        data: {
            bookings
        }
    });
});

exports.getAllbookingsforAdmin = catchAsyncError(async (req, res, next) => {
    const bookings = await Booking.find().populate('activity').populate('user');
    res.status(200).json({
        success: true,
        data: bookings
    })
})

exports.updateBookingStatus = catchAsyncError(async (req, res, next) => {
    const bookingId = req.params.id;
    const { paymentStatus } = req.body;

    const booking = await Booking.findByIdAndUpdate(
        bookingId,
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
        data: {
            booking
        }
    });
});

exports.updateBookingStatus = catchAsyncError(async (req, res, next) => {
    const bookingId = req.params.id;
    const { paymentStatus } = req.body;

    const booking = await Booking.findByIdAndUpdate(
        bookingId,
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
        data: {
            booking
        }
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
