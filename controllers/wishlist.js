const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Wishlist = require("../models/Wishlist");
const ErrorHandler = require("../utils/errorHandler");
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

exports.addToWhislistPakage = catchAsyncError(async( req, res, next) => {
    const userId = req.user._id;
    const pakageId = req.params.id;
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId });
    }
    wishlist.packages.push(pakageId);
    res.status(200).json({
        success: true,
        message:'Successfully added to wishlsit'
    })
})

// exports.addToWishlist = catchAsyncError(async (req, res, next) => {
//     const userId = req.user._id;
//     const itemId = req.params.id; // Activity or Pakage ID

//     let wishlist = await Wishlist.findOne({ user: userId });
//     if (!wishlist) {
//         wishlist = await Wishlist.create({ user: userId });
//     }

//     if (req.baseUrl.includes('activities')) {
//         wishlist.activities.push(itemId);
//     } else if (req.baseUrl.includes('pakages')) {
//         wishlist.packages.push(itemId);
//     }

//     await wishlist.save();

//     res.status(201).json({
//         success: true,
//         message: 'Successfully added to wishlist'
//     });
// });


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

// exports.removeFromWishlist = catchAsyncError(async (req, res, next) => {
//     const userId = req.user._id;
//     const itemId = req.params.id; // Activity or Pakage ID

//     let wishlist = await Wishlist.findOne({ user: userId });
//     if (!wishlist) {
//         return res.status(404).json({
//             status: 'error',
//             message: 'Wishlist not found'
//         });
//     }

//     if (req.baseUrl.includes('activities')) {
//         const indexToRemove = wishlist.activities.indexOf(itemId);
//         if (indexToRemove !== -1) {
//             wishlist.activities.splice(indexToRemove, 1);
//             await wishlist.save();
//         }
//     } else if (req.baseUrl.includes('pakages')) {
//         const indexToRemove = wishlist.packages.indexOf(itemId);
//         if (indexToRemove !== -1) {
//             wishlist.packages.splice(indexToRemove, 1);
//             await wishlist.save();
//         }
//     }

//     res.status(200).json({
//         status: 'success',
//         message: 'Item removed from wishlist'
//     });
// });

exports.removeFromWishlist = catchAsyncError(async(req, res, next) => {
    const userId = req.user._id;
    const activityId = req.params.id;

    const wishlist = await Wishlist.findOne({user: userId});
    if(!wishlist){
        return next(new ErrorHandler('wishlist not found', 404))
    }
    const indexToRemove = wishlist.activities.indexOf(activityId);
    if(indexToRemove !== -1){
        wishlist.activities.splice(indexToRemove,1);
        await wishlist.save()
    }
    res.status(200).json({
        success: true,
        message: 'Activity Removed from wishlist'
    })
})