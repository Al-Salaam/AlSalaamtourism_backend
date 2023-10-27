const express = require('express');
const dotenv = require("dotenv");
const morgan = require('morgan');
const ErrorMiddleware = require('./middlewares/Error');
const user = require("./routers/user");
const activity = require('./routers/activity');
const pakage = require('./routers/pakage');
const inquiry = require('./routers/inquiry');
const wishlist = require("./routers/wishlist");
const booking = require('./routers/booking');
const { connectPassport } = require('./utils/Provider');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const contact = require('./routers/contact');

const app = express();

dotenv.config({
    path: './config/config.env'
});


app.set('trust proxy', 1); // Trust proxy headers

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        secure: true,    // Set to true to require HTTPS for cookies
        httpOnly: true,
        sameSite: 'none', // Set to 'none' for cross-site cookies
    },
    proxy: true, // Set to true when running behind a proxy
}));

app.use(cookieParser());

app.use(passport.authenticate('session'));
app.use(passport.initialize());
app.use(passport.session());

connectPassport();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

const allowedOrigins = [
    process.env.FRONTEND_CONSUMER_URL,
    process.env.DEVELOPEMENT_MODE_CONSUMER
];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
};

app.use(cors(corsOptions));


app.use('/api/v1', user);
app.use('/api/v1', activity);
app.use('/api/v1', pakage);
app.use('/api/v1', wishlist);
app.use('/api/v1', inquiry);
app.use('/api/v1', booking);
app.use('/api/v1', contact);

app.use(ErrorMiddleware);

module.exports = app;
