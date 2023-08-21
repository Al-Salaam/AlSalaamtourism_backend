const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String
    },
    username:{
        type: String,
        unique: true
    },
    email:{
        type: String,
        unique: true
    }, 
    password:{
        type: String
    },
    photo: {
        type: String
    },
    googleId:{
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    }
},
{
    timestamps: true
})

module.exports = mongoose.model("User", schema);