const passport = require("passport");
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");

exports.registeration = catchAsyncError(async(req, res , next) => {
    const {name, username, email, password} = req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){
        return next(new ErrorHandler("User already exist ", 400))
    }
    const newUser = new User({
        name, username, email, password
    })

    await newUser.save();
    res.status(201).json({
        success: true,
        message: "Successfully registered",
        user: newUser

    })
})

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
  
      if (!user) {
        return next(new ErrorHandler(info.message, 401));
      }
  
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
  
        res.status(200).json({ success: true, message: 'Login successful', user });
      });
    })(req, res, next);
  };

exports.getMyProfile = (req, res, next) =>{
    res.status(200).json({
        success: true,
        user: req.user
    })
}

exports.logout = (req,res, next) => {
    req?.session?.destroy((err) => {
        if(err) return next(err);
        res.clearCookie("connect.sid");
        res.status(200).json({
            message: "logout Successfully"
        })
    })
}