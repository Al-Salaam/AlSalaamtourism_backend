const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const createTransporter = require("../utils/nodemailer");
const crypto = require("crypto");
const jwt = require('jsonwebtoken')

exports.registeration = catchAsyncError(async (req, res, next) => {
  const { name, username, email, password } = req.body;
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return next(
      new ErrorHandler("User with email or username already exists", 409)
    );
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

  // Create token data
  const tokenData = {
    _id: user._id,
    email: user.email,
  };

  // JWT Token
  const accessToken = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  // Refresh Token
  const refreshToken = jwt.sign(tokenData, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  // Save refreshToken in the user model
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const accessTokenOptions = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Set the cookie expiration time to 15 days from now
    httpOnly: true, // Make the cookie accessible only through HTTP(S) requests, not JavaScript
    secure: true, // Send the cookie only over secure (HTTPS) connections
    sameSite: "none", // Allow cross-site requests to include the cookie (required for third-party authentication)
  };
  const refreshTokenOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  return res.status(200).json({
    message: "Login successfully",
    user,
    accessToken,
    refreshToken,
  });
});



exports.refresh_Token = catchAsyncError(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
      return next(new ErrorHandler("Refresh Token is required", 400));
  }

  try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded._id);

      if (!user || user.refreshToken !== refreshToken) {
          return next(new ErrorHandler("Invalid Refresh Token", 400));
      }

      const newToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15d" });

      res.status(200).json({
          success: true,
          accessToken: newToken
      });
  } catch (error) {
      return next(new ErrorHandler("Invalid Refresh Token", 400));
  }
});

exports.getMyprofile = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.user._id);
  
  if (!user) {
      return next(new ErrorHandler("User not found", 404));
  }

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

  const user = await User.findOne({ email }).select("+password");

  // Check if the user exists
  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // Check if the user has the 'admin' role
  if (user.role !== "admin") {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // Check if the provided password matches the stored password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // Create token data
  const tokenData = {
    _id: user._id,
    email: user.email,
    role: user.role // Include the role in the token data
  };

  // JWT Token
  const accessToken = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  // Refresh Token
  const refreshToken = jwt.sign(tokenData, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  // Save refreshToken in the user model
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const accessTokenOptions = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Set the cookie expiration time to 15 days from now
    httpOnly: true, // Make the cookie accessible only through HTTP(S) requests, not JavaScript
    secure: true, // Send the cookie only over secure (HTTPS) connections
    sameSite: "none", // Allow cross-site requests to include the cookie (required for third-party authentication)
  };
  const refreshTokenOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  // Set cookies in the response
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  // Send response with tokens
  return res.status(200).json({
    message: "Admin login successful",
    user,
    accessToken,
    refreshToken,
  });
});


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
  if (!oldPassword || !newPassword) {
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

// exports.logout = catchAsyncError(async (req, res, next) => {
//   if (!req.cookies.access_token && !req.cookies.refresh_token) {
//     return next(new ErrorHandler("You are not logged in", 401));
//   }
//   res
//     .status(200)
//     .cookie("access_token", null, {
//       expires: new Date(Date.now()),
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//     })
//     .cookie("refresh_token", null, {
//       expires: new Date(Date.now()),
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//     })
//     .json({
//       success: true,
//       message: "logout Successfully",
//     });
// });


exports.logout = catchAsyncError(async (req, res, next) => {
  let token;

  // Check if access_token is available in cookies
  if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  // If access_token is not found in cookies, check in request headers
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from authorization header
    token = req.headers.authorization.split(' ')[1];
  } else if (!token && req.headers['x-access-token']) {
    // Extract token from custom header
    token = req.headers['x-access-token'];
  }

  // If neither access_token nor refresh_token are available, return error
  if (!token && !req.cookies.refresh_token) {
    return next(new ErrorHandler("You are not logged in", 401));
  }

  // Clear cookies and send response
  res
    .status(200)
    .clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logout Successfully",
    });
});


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

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("user not found", 400));
  }
  const resetToken = await user.getResetToken();
  await user.save();
  const url = `${process.env.FRONTEND_CONSUMER_URL}/resetpassword/${resetToken}`;
  const message = `Click on the link to reset your password. ${url}, if you have not request then please ignore`;
  const mailOptions = {
    to: user.email,
    subject: "Reset Password",
    text: message,
  };
  const transporter = createTransporter();
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
  res.status(200).json({
    success: true,
    url: url,
    message: `Reset token has been sent to ${user.email}`,
  });
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return next(new ErrorHandler("Token is invalid or has been expired"));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed sucessfully",
  });
});
