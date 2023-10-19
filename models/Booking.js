const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    activity: {
        type: mongoose.Schema.ObjectId,
        ref: 'Activity',
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    date: {
        type: Date,
        
    },
    adults: {
        type: Number,
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
