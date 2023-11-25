const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const { catchAsyncError } = require("./catchAsyncError");
const jwt = require('jsonwebtoken')

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHandler("Not Login"), 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id).populate('role'); // Populate the 'role' field
    next();
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