const mongoose = require("mongoose");
const bcrypt = require('bcrypt');


const schema = new mongoose.Schema({
    name: {
        type: String
    },
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    photo: {
        type: String
    },
    googleId: {
        type: String,

    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    wishlist: {
        type: mongoose.Schema.ObjectId,
        ref: 'Wishlist'
    },
    homeairport: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    zipcode: {
        type: Number
    },
    country: {
        type: String
    }


},
    {
        timestamps: true
    });

schema.pre('save', async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

schema.pre('save', async function (next) {
    if (!this.photo) {
        this.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}`;
    }
    next();
});



module.exports = mongoose.model("User", schema);
