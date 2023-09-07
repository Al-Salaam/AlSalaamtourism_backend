const express = require('express');
const dotenv = require("dotenv");
const morgan = require('morgan');
const ErrorMiddleware = require('./middlewares/Error');
const user = require("./routers/user");
const activity = require('./routers/activity');
const pakage = require('./routers/pakage');
const inquiry = require('./routers/inquiry');
const wishlist = require("./routers/wishlist");
const booking = require('./routers/booking')
const { connectPassport } = require('./utils/Provider');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const  app = express();

dotenv.config({
    path:'./config/config.env'
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 15 * 24 * 60 * 60 * 1000, // Set the session to expire after 15 days (in milliseconds)
    },
}));


app.use(cookieParser());

app.use(passport.authenticate('session'));
app.use(passport.initialize());
app.use(passport.session());

connectPassport();


app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(morgan('tiny'));

app.use(cors({ // Enable CORS and specify the allowed frontend URL
    origin: process.env.FRONTEND_URL, // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable credentials (cookies, authorization headers)
}));


app.use('/api/v1', user);
app.use('/api/v1', activity);
app.use('/api/v1', pakage);
app.use('/api/v1', wishlist);
app.use('/api/v1', inquiry);
app.use('/api/v1', booking)
module.exports = app;

app.use(ErrorMiddleware);