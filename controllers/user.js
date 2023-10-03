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
    const page = parseInt(req.query.page) || 1; // Current page number (default to 1 if not specified)
    const limit = parseInt(req.query.limit) || 8; // Number of activities per page (default to 10 if not specified)

    const skip = (page - 1) * limit;
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);
    const users = await User.find()
        .skip(skip)
        .limit(limit);
    res.status(200).json({
        success: true,
        data: {
            users,
            page,
            totalPages,
            totalUsers
        }
    })
})

exports.changePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user; // Assuming you have authenticated the user

    // Check if the old password matches the current password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
        return next(new ErrorHandler('Old password is incorrect', 401));
    }

    // Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
    });
});


exports.logout = (req, res, next) => {
    req?.session?.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid",
        // {
        //     secure: process.env.NODE_ENV === "development" ? false : true,
        //     httpOnly: process.env.NODE_ENV === "development" ? false : true,
        //     sameSite: process.env.NODE_ENV === "development" ? false : "none"
        // }
        );
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



exports.updateUserRole = catchAsyncError(async (req, res , next) => {
    const { id } = req.params;
    const { newRole } = req.body;

    // Find the user by ID and update their role
    const user = await User.findByIdAndUpdate(id, { role: newRole }, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
})


exports.deleteAllUsers = catchAsyncError(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findOneAndDelete({_id : userId});
    if(!user) {
        return next(new ErrorHandler("user not found" , 404))
    }

    res.status(200).json({
        success: true,
        message: "Deleted Successfully"
    })
})