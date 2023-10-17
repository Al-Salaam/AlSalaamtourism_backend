const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Activity = require("../models/Activity");
const Pakage = require("../models/Pakage");
const Wishlist = require("../models/Wishlist");
const ErrorHandler = require("../utils/errorHandler");


exports.addToWishlist = catchAsyncError(async (req, res, next) => {
    const { itemId, itemType } = req.body;
    const userId = req.user._id;
    let wishlist = await Wishlist.findOne({ user: userId });

    // If wishlist does not exist, create a new one for the user
    if (!wishlist) {
        wishlist = new Wishlist({ user: userId, activities: [], packages: [] });
    }

    let itemToAdd;
    if (itemType === 'activity') {
        itemToAdd = await Activity.findById(itemId);
    } else if (itemType === 'package') {
        itemToAdd = await Pakage.findById(itemId); // Assuming Pakage is your model name for packages
    }

    if (!itemToAdd) {
        return next(new ErrorHandler("Item not found", 404));
    }

    // Check if the item is already in the wishlist
    const itemExists = wishlist.activities.includes(itemToAdd._id) || wishlist.packages.includes(itemToAdd._id);
    if (itemExists) {
        return next(new ErrorHandler("Item already exists in the wishlist", 400));
    }

    // Add the item to the appropriate list (activities or packages)
    if (itemType === 'activity') {
        wishlist.activities.push(itemToAdd._id);
    } else if (itemType === 'package') {
        wishlist.packages.push(itemToAdd._id);
    }

    await wishlist.save();

    res.status(200).json({ message: 'Item added to wishlist successfully' });
});



exports.getWishlist = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id; // Assuming you're using req.user to get the authenticated user's ID

    // Find the wishlist for the user
    const wishlist = await Wishlist.findOne({ user: userId }).populate('activities packages');

    if (!wishlist) {
        return res.status(404).json({
            success: false,
            message: 'Wishlist not found'
        });
    }

    // Send the wishlist data back as a response
    res.status(200).json({
        success: true,
        wishlist
    });
});



exports.removeFromWishlist = catchAsyncError(async (req, res, next) => {
    const { itemId, itemType } = req.body;
    const userId = req.user._id;
    
    // Check if itemId is provided in the request body
    if (!itemId) {
        return next(new ErrorHandler("Item ID is missing in the request", 400));
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
        return next(new ErrorHandler("Wishlist not found for the user", 404));
    }

    let itemToRemove;

    if (itemType === 'activity') {
        itemToRemove = itemId;
        wishlist.activities.pull(itemToRemove);
    } else if (itemType === 'package') {
        itemToRemove = itemId;
        wishlist.packages.pull(itemToRemove);
    } else {
        return next(new ErrorHandler("Invalid item type", 400));
    }

    await wishlist.save();

    res.status(200).json({ message: 'Item removed from wishlist successfully' });
});
