const express = require('express');
const dotenv = require("dotenv");
const morgan = require('morgan');
const ErrorMiddleware = require('./middlewares/Error');
const user = require("./routers/user");
const activity = require('./routers/activity');
const pakage = require('./routers/pakage');
const wishlist = require("./routers/wishlist")
const { connectPassport } = require('./utils/Provider');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const  app = express();

dotenv.config({
    path:'./config/config.env'
});

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(cookieParser());

app.use(passport.authenticate('session'));
app.use(passport.initialize());
app.use(passport.session());

connectPassport();

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(morgan('tiny'));

app.use('/api/v1', user);
app.use('/api/v1', activity);
app.use('/api/v1', pakage);
app.use('/api/v1', wishlist);
module.exports = app;

app.use(ErrorMiddleware);