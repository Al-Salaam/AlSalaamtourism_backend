const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Activity = require("../models/Activity");
const ErrorHandler = require("../utils/errorHandler");
exports.createActivity = catchAsyncError(async (req, res, next) => {
    const {
        name,shortdescription,price,rating,description,keyinstructions,reservationpolicy,benifits,duration,cancellation,groupsize,languages,highlights,included,excluded,categorey,images
    } = req.body;
    const newActivity = await Activity.create({
        name,shortdescription,price,rating,description,keyinstructions,reservationpolicy,benifits,duration,cancellation,groupsize,languages,highlights,included,excluded,categorey,images
    });

    res.status(201).json({
        status: 'success',
        message:'Successfully created',
        data: {
            activity: newActivity
        }
    });
})

exports.getAllActivities = catchAsyncError(async (req, res, next) => {
    const activities = await Activity.find();

    res.status(200).json({
        status: 'success',
        data: {
            activities
        }
    });
});


exports.getActivityById = catchAsyncError(async (req, res, next) => {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
        return next(new ErrorHandler("activity not found", 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            activity
        }
    });
});


exports.updateActivityById = catchAsyncError(async (req, res, next) => {
    const updatedActivity = await Activity.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedActivity) {
        return next(new ErrorHandler("activity not found", 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            activity: updatedActivity
        }
    });
});


exports.deleteActivityById = catchAsyncError(async (req, res, next) => {
    const deletedActivity = await Activity.findByIdAndDelete(req.params.id);

    if (!deletedActivity) {
        return res.status(404).json({
            status: 'error',
            message: 'Activity not found'
        });
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});


exports.createActivityReview = catchAsyncError(async (req, res, next) => {
    // if (!req.user) {
    //     return res.status(401).json({
    //         success: false,
    //         message: "User is not authenticated"
    //     });
    // }

    const {rating, comment, activityId} = req.body;
    const review = {
        user: req.user._id,
        name:req.user.name,
        rating: Number(rating),
        comment
    }
    const activity = await Activity.findById(activityId);
    const isReviewed = activity.reviews.find((rev) => rev.user.toString() === req.user._id.toString());
    if(isReviewed) {
        activity.reviews.forEach((rev) => {
            if(rev.user.toString() === req.user._id.toString())
            (rev.rating = rating),(rev.comment = comment);
        })
    }else{
        activity.reviews.push(review);
        activity.noOfReviews = activity.reviews.length;
    }

    let avg = 0;
    activity.reviews.forEach((rev) => {
        avg += rev.rating;
    })

    activity.ratings = avg / activity.reviews.length;

    await activity.save({
        validateBeforeSave: false
    })
    res.status(200).json({
        success:true,

    })

})


exports.getAllRevirews = catchAsyncError(async( req, res, next) => {
    const activity = await Activity.findById(req.query.id);
    if(!activity) {
        return next(new ErrorHandler("activity not found", 404))
    }
    res.status(200).json({
        success: true,
        data: activity.reviews
    })
})