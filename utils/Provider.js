const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const passport = require("passport");
const User = require('../models/User');

exports.connectPassport = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }, async function (accessToken, refreshToken, profile, done) {

        // DATABASE COME HERE
        const user = await User.findOne({
            googleId: profile.id
        })

        if(!user){
            const email = (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : null;
            const username = profile.username;
            const newUser = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                username: username, // Store the extracted username
                email: email,
                photo: profile.photos[0]?.value || null,
                
            })

            return done(null , newUser)
        }else{
            return done(null , user)
        }


    }));

 passport.serializeUser((user, done) => {
    done(null, user.id)
 })

 passport.deserializeUser(async (id, done) => {
    // find user id
    const user = await User.findById(id);
    done(null, user)
 })

}

