const passport = require("passport");
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const bcrypt = require('bcrypt');
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

// admin login 
exports.adminLogin = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return next(new ErrorHandler(info.message, 401));
        }

        // Check if the user is an admin
        if (user.role === "admin") {
            // If the user is an admin, log them in
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }

                res.status(200).json({ success: true, message: 'Admin login successful', user });
            });
        } else {
            // If the user is not an admin, deny access
            return next(new ErrorHandler('Only admins can log in.', 401));
        }
    })(req, res, next);
};


exports.getMyProfile = (req, res, next) =>{
    res.status(200).json({
        success: true,
        user: req.user
    })
}

// admin get all users
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    data: users
  })
})

// exports.changePassword = (req, res, next) => {
//   passport.authenticate('local', async (err, user, info) => {
//       if (err) {
//           return next(err);
//       }

//       if (!user) {
//           return next(new ErrorHandler(info.message, 401));
//       }

//       // Check if the new password and confirmation password match
//       if (req.body.newPassword !== req.body.confirmPassword) {
//           return next(new ErrorHandler('New password and confirmation password do not match', 400));
//       }

//       // Hash and update the new password
//       user.password = await bcrypt.hash(req.body.newPassword, 10);

//       // Save the updated user profile with the new password
//       await user.save();

//       res.status(200).json({
//           success: true,
//           message: 'Password changed successfully',
//       });
//   })(req, res, next);
// };


// changes password

exports.logout = (req,res, next) => {
    req?.session?.destroy((err) => {
        if(err) return next(err);
        res.clearCookie("connect.sid");
        res.status(200).json({
            message: "logout Successfully"
        })
    })
}