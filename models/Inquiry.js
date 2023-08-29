const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    travelDate: {
        type: Date,

    },
    numberOfRooms: {
        type: Number,

    },
    totalDaysOfVisit: {
        type: Number,

    },
    travellersNationality: {
        type: String,

    },
    durationOrNightStays: {
        type: Number,

    },
    preferSingleOrDoubleOccupancy: {
        type: String,
        enum: ['1 pax', '2 pax'],

    },
    numberOfAdults: {
        type: Number,

    },
    numberOfChildren: {
        type: String,
        
    },
    
    selectedHotel: {
        type: String
    },
    preferMealSelection: {
        type: String
    },
    excursionSelection: {
        type: String,
        enum: ['with ticket', 'without ticket']
    },
    covid19VaccineDoses: {
        type: Number
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
        enum:['pending', 'complete'],
        default:'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Inquiry", schema);