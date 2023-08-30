const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    activity: {
        type: mongoose.Schema.ObjectId,
        ref: 'Activity',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    adults: {
        type: Number,
        required: true
    },
    children: {
        type: Number,
        default: 0
    },
    infants: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    paymentIntentId: { // New field to store Stripe Payment Intent ID
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);
