const { catchAsyncError } = require("../middlewares/catchAsyncError");
const NewsLetter = require("../models/NewsLetter");
const ErrorHandler = require("../utils/errorHandler");

exports.createNewsLetter = catchAsyncError(async (req, res, next) => {
    const {email} = req.body;
    const existingEmail = await NewsLetter.findOne({email});
    if(existingEmail) {
        return next(new ErrorHandler("This email is already exist", 400));
    }

    const newsletter = await NewsLetter({
        email
    })

    await newsletter.save()

    res.status(201).json({
        success: true,
        message: "Subscription successful"
    })
})