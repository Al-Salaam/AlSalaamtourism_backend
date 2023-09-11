const passport = require("passport");
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const bcrypt = require('bcrypt');
exports.registeration = catchAsyncError(async (req, res, next) => {
    const { name, username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
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
            // Handle incorrect credentials here
            return next(new ErrorHandler("Invalid credentials", 401))
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
            return next(new ErrorHandler("Only admin can login", 401))
        }
    })(req, res, next);
};


exports.getMyProfile = (req, res, next) => {
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

// exports.changePassword = async (req, res, next) => {
//     try {
//       const { oldPassword, newPassword, confirmPassword } = req.body;

//       // Check if new password and confirm password match
//       if (newPassword !== confirmPassword) {
//         throw new ErrorHandler("New password and confirm password do not match", 400);
//       }

//       // Check if old password matches the user's current password
//       const isOldPasswordValid = await req.user.authenticate(oldPassword);

//       if (!isOldPasswordValid) {
//         throw new ErrorHandler("Incorrect old password", 401);
//       }

//       // Set the new password using setPassword provided by passport-local-mongoose
//       req.user.setPassword(newPassword, async () => {
//         await req.user.save();

//         res.status(200).json({
//           success: true,
//           message: "Password changed successfully",
//         });
//       });
//     } catch (error) {
//       next(error);
//     }
//   };


// changes password

exports.logout = (req, res, next) => {
    req?.session?.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid");
        res.status(200).json({
            message: "logout Successfully"
        })
    })
}


exports.addLocationInformation = catchAsyncError(async (req, res, next) => {
    const { homeairport, address, city, state, zipcode, country } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }
    if (homeairport) {
        user.homeairport = homeairport
    }
    if (address) {
        user.address = address
    }
    if (city) {
        user.city = city
    }
    if (state) {
        user.state = state
    }
    if (zipcode) {
        user.zipcode = zipcode
    }
    if (country) {
        user.country = country
    }
    await user.save();
    res.status(200).json({
        success: true,
        user,
        message: "Location information add sucessfully"
    })
})