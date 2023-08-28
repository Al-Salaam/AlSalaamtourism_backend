const ErrorHandler = require("../utils/errorHandler");


exports.isAuthenticated = (req, res, next) => {
    const token = req?.cookies["connect.sid"];
    if(!token){
        return next(new ErrorHandler("Not logged In", 401))
    }
    next();
}

// const isAuthenticated = (req, res, next) => {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     // Redirect or send an error response if not authenticated
//     res.status(401).json({
//         success: false,
//         message: 'Not authenticated'
//     });
// };

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