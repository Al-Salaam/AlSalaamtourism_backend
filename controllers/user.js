const { catchAsyncError } = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

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