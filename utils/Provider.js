const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const LocalStrategy = require('passport-local').Strategy;
const passport = require("passport");
const User = require('../models/User');
const bcrypt = require('bcrypt');

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

        if (!user) {

            const newUser = await User.create({
                googleId: profile.id || null, // Set googleId only if provided
                name: profile.displayName,
                photo: profile.photos[0]?.value || null,

            })

            return done(null, newUser)
        } else {
            return done(null, user)
        }


    }));


    //local strategy
    // Local Strategy Configuration
    passport.use(
        new LocalStrategy({ usernameField: 'email', passwordField: 'password', }, async (email, password, done) => {
            try {
                const user = await User.findOne({ email });

                if (!user) {
                    return done(null, false, { message: 'Email not registered' });
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return done(null, false, { message: 'Incorrect password' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );



    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser(async (id, done) => {
        // find user id
        const user = await User.findById(id);
        done(null, user)
    })

}



