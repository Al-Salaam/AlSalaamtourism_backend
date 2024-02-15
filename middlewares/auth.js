const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const { catchAsyncError } = require("./catchAsyncError");
const jwt = require("jsonwebtoken");

// exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
//   const { access_token } = req.cookies;
//   if (!access_token) {
//     return next(new ErrorHandler("Not logged in", 401));
//   }

//   const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
//   req.user = await User.findById(decoded._id).populate("role");
//   next();
// });

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
    let token;
  
    // Check if access_token is available in cookies
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
  
    // If token is not found in cookies, check in request headers
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from authorization header
      token = req.headers.authorization.split(' ')[1];
    } else if (!token && req.headers['x-access-token']) {
      // Extract token from custom header
      token = req.headers['x-access-token'];
    }
  
    // If token is not found in cookies or headers, return error
    if (!token) {
      return next(new ErrorHandler("Not logged in", 401));
    }
  
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Find user by decoded ID
      req.user = await User.findById(decoded._id).populate("role");
      next();
    } catch (error) {
      return next(new ErrorHandler("Unauthorized", 401));
    }
  });
  
  
exports.authorizeRole = (authorizedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("Not logged in", 401));
    }

    if (!authorizedRoles.includes(req.user.role)) {
      return next(new ErrorHandler("Unauthorized", 403));
    }

    next();
  };
};
