const ErrorHandler = require("../utils/errorHandler");


exports.isAuthenticated = (req, res, next) => {
    const token = req?.cookies["connect.sid"];
    if(!token){
        return next(new ErrorHandler("Not logged In", 401))
    }
    next();
}