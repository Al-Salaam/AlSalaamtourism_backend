const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title: {
        type: String
    },
    firstname:{
        type:String,
    },
    lastname:{
        type: String,
    },
    email:{
        type:String
    },
    phone: {
        type: Number
    },
    specialRequirment:{
        type: String
    },

    nationality:{
        type: String
    },

    packages: {
        type: mongoose.Schema.ObjectId,
        ref: 'Pakage'
    },
    
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',

    },
    status:{
        type: String,
        enum:['pending', 'completed'],
        default:'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Inquiry", schema);