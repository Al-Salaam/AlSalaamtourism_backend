const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const crypto = require("crypto");
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
        type: String,
        select: false
    },
    photo: {
        type: String
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
    },
    phone:{
        type: String
    },
    aboutself:{
        type: String
    },
    refreshToken: {
        type: String,
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpire: String,

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

schema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

// schema.methods.generateToken = function(){
    
//     return jwt.sign({_id : this._id}, process.env.JWT_SECRET, {
//         expiresIn : '15d'
//     })
// }

schema.methods.getResetToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

module.exports = mongoose.model("User", schema);
