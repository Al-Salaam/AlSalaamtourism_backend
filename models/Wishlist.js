const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    activities: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Activity'
    }]
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
