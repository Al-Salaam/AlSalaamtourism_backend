const passport = require("passport");
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const { sendToken } = require("../utils/sendToken");
exports.registeration = catchAsyncError(async (req, res, next) => {
  const { name, username, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User already exist ", 400));
  }
  const newUser = new User({
    name,
    username,
    email,
    password,
  });

  await newUser.save();
  res.status(201).json({
    success: true,
    message: "Successfully registered",
    user: newUser,
  });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) {
    return next(new ErrorHandler("Please enter the email", 400));
  }
  if (!password) {
    return next(new ErrorHandler("Please enter the password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  
  if (!user) {
    return next(new ErrorHandler("Incorrect email or password", 401));
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Incorrect email or password", 401));
  }
  sendToken(res, user, `Login Successfully`, 200);
});

exports.getMyprofile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select('+password');

    // Check if the user exists and has the 'admin' role
    if (!user || user.role !== 'admin') {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    // Check if the provided password matches the stored password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    // Send token if authentication is successful
    sendToken(res, user, "Admin login successful");
})

// exports.login = (req, res, next) => {
//   passport.authenticate("local", (err, user, info) => {
//     if (err) {
//       return next(err);
//     }

//     if (!user) {
//       return next(new ErrorHandler(info.message, 401));
//     }

//     req.logIn(user, (err) => {
//       if (err) {
//         return next(err);
//       }

//       res
//         .status(200)
//         .json({ success: true, message: "Login successfully", user });
//     });
//   })(req, res, next);
// };

// // admin login
// exports.adminLogin = (req, res, next) => {
//   passport.authenticate("local", async (err, user, info) => {
//     if (err) {
//       return next(err);
//     }

//     if (!user) {
//       // Handle incorrect credentials here
//       return next(new ErrorHandler("Invalid credentials", 401));
//     }

//     // Check if the user is an admin
//     if (user.role === "admin") {
//       // If the user is an admin, log them in
//       req.logIn(user, (err) => {
//         if (err) {
//           return next(err);
//         }

//         res
//           .status(200)
//           .json({ success: true, message: "Login successful", user });
//       });
//     } else {
//       // If the user is not an admin, deny access
//       return next(new ErrorHandler("Only admin can login", 401));
//     }
//   })(req, res, next);
// };

// exports.getMyProfile = (req, res, next) => {
//   res.status(200).json({
//     success: true,
//     user: req.user,
//   });
// };

// admin get all users
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Current page number (default to 1 if not specified)
  const limit = parseInt(req.query.limit) || 8; // Number of activities per page (default to 10 if not specified)

  const skip = (page - 1) * limit;
  const totalUsers = await User.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit);
  const users = await User.find().skip(skip).limit(limit);
  res.status(200).json({
    success: true,
    data: {
      users,
      page,
      totalPages,
      totalUsers,
    },
  });
});

exports.changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword ) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return next(new ErrorHandler("incorrect old password", 400));
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// exports.changePassword = async (req, res, next) => {
//   try {
//     const userId = req.user._id; // Assuming your User model has an '_id' field for the user's ID
//     const { oldPassword, newPassword } = req.body; // Extract oldPassword and newPassword from the request body

//     // Check if both oldPassword and newPassword are provided in the request body
//     if (!oldPassword || !newPassword) {
//       return next(
//         new ErrorHandler(
//           "Both old password and new password are required.",
//           400
//         )
//       );
//     }

//     // Find the user by ID
//     const user = await User.findById(userId);

//     if (!user) {
//       return next(new ErrorHandler("User not found", 404));
//     }

//     // Compare the oldPassword provided in the request with the hashed password in the database
//     const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

//     if (!isPasswordValid) {
//       return next(new ErrorHandler("Invalid old password", 401));
//     }

//     // Hash the new password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

//     // Update the user's password in the database
//     await User.findByIdAndUpdate(userId, { password: hashedPassword });

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error(error); // Log the error for debugging purposes
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

exports.logout = catchAsyncError(async (req, res, next) => {
  if (!req.cookies.token) {
    return next(new ErrorHandler("You are not logged in", 401));
  }
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "logout Successfully",
    });
});

// exports.logout = (req, res, next) => {
//   req?.session?.destroy((err) => {
//     if (err) return next(err);
//     res.clearCookie("connect.sid", {
//       secure: true,
//       httpOnly: true,
//       sameSite: "none",
//     });
//     res.status(200).json({
//       message: "logout Successfully",
//     });
//   });
// };

exports.addLocationInformation = catchAsyncError(async (req, res, next) => {
  const { homeairport, address, city, state, zipcode, country } = req.body;
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (homeairport) {
    user.homeairport = homeairport;
  }
  if (address) {
    user.address = address;
  }
  if (city) {
    user.city = city;
  }
  if (state) {
    user.state = state;
  }
  if (zipcode) {
    user.zipcode = zipcode;
  }
  if (country) {
    user.country = country;
  }
  await user.save();
  res.status(200).json({
    success: true,
    user,
    message: "Location information add sucessfully",
  });
});

exports.updatePersonalInfo = catchAsyncError(async (req, res, next) => {
  const { name, phone, email, aboutself } = req.body; // Extract updated fields from the request body
  const userId = req.user._id;

  // Find the user by ID
  let user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Update user fields if provided in the request body
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (email) user.email = email;
  if (aboutself) user.aboutself = aboutself;

  // Save the updated user object
  await user.save();

  // Return the updated user object as the response
  res.status(200).json({
    message: "Successfully Updated",
  });
});

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { newRole } = req.body;

  // Find the user by ID and update their role
  const user = await User.findByIdAndUpdate(
    id,
    { role: newRole },
    { new: true }
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    user,
  });
});

exports.deleteAllUsers = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findOneAndDelete({ _id: userId });
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Deleted Successfully",
  });
});
