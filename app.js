const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const ErrorMiddleware = require("./middlewares/Error");
const user = require("./routers/user");
const activity = require("./routers/activity");
const pakage = require("./routers/pakage");
const inquiry = require("./routers/inquiry");
const wishlist = require("./routers/wishlist");
const booking = require("./routers/booking");
const { connectPassport } = require("./utils/Provider");
const session = require("express-session");
const passport = require("passport");
const connectMongo = require('connect-mongo');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const contact = require("./routers/contact");

const app = express();

dotenv.config({
  path: "./config/config.env",
});

app.set("trust proxy", 1);
app.use(cookieParser());
app.use(
    session({
        name:"mycookie",
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: false,
      proxy: true, // *
      cookie: {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : false, // *
        secure: true, // *
        domain:"http://localhost:3000", 
        path:"http://localhost:3000"
      },
      store: connectMongo.create({
        mongoUrl: process.env.MONGO_URL,
        ttl: 60 * 60
      })
    })
  );

app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());

// app.enable("trust proxy");
connectPassport();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

const allowedOrigins = [
  process.env.FRONTEND_DASHBOARD_URL,
  process.env.FRONTEND_CONSUMER_URL,
  process.env.DEVELOPMENT_CONSUMER_URL,
  process.env.DEVELOPMENT_DASHBOARD_URL,
  "https://tourism-dashboard-three.vercel.app/", // Add your vercel frontend domain
];

app.use(
  cors(
    {
    origin: function (origin, callback) {
      // Check if the request origin is in the allowedOrigins array

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  }
  )
);

app.use("/api/v1", user);
app.use("/api/v1", activity);
app.use("/api/v1", pakage);
app.use("/api/v1", wishlist);
app.use("/api/v1", inquiry);
app.use("/api/v1", booking);
app.use("/api/v1", contact);
module.exports = app;

app.use(ErrorMiddleware);
