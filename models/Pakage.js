const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    heading: {
        type: String,
    },
    description:{
        type:String
    },
    keyIntructions:{
        type: String
    },
    cancellationguide:{
        type:String
    },
    childpolicy:{
        type:String
    },
    tourbenifits:{
        type: String
    },
    duration:{
        type: String
    },
    cancellation:{
        type:String
    },
    groupsize:{
        type:String
    },
    languages:{
        type:String
    }, 
    ratings:{
        type:Number
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
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Pakage', schema)