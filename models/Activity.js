const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String
    },
    shortdescription: {
        type: String
    },
    price: {
        type: Number
    },
    ratings: {
        type: Number
    },
    description: {
        type: String
    },
    keyinstructions: {
        type: String
    },
    reservationpolicy: {
        type: String
    },
    benifits: {
        type: String
    },
    duration: {
        type: String
    },
    cancellation: {
        type: String
    },
    groupsize: {
        type: String
    },
    languages: [
         String
    ],
    highlights: [String],
    included: [String],
    excluded: [String],
    categorey: {
        type: String,
        enum: ['activity', 'tour']
    },
    images: [{
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    }]
    ,
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            name: {
                type: String
            },
            rating: {
                type: Number
            },
            comment: {
                type: String
            }
        }
    ],
    noOfReviews: {
        type: Number,
        default: 0
    },
    itemType:{
        type: String,
        default: "activity"
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("Activity", schema);