const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Wishlist = require("../models/Wishlist");

exports.addToWishList = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    const activityId = req.params.id; // Corrected line

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId });
    }
    wishlist.activities.push(activityId); // Corrected line
    await wishlist.save();

    res.status(201).json({
        success: true,
        message: 'Successfully added to wishlist'
    });
});



exports.getWishlist = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id; // Assuming you have user information in req.user

    const wishlist = await Wishlist.findOne({ user: userId })
        .populate('activities', 'name shortdescription price');

    res.status(200).json({
        status: 'success',
        data: {
            wishlist
        }
    });
});