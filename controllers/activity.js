const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Activity = require("../models/Activity");
const getDataUri = require("../utils/dataUri");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require('cloudinary');


exports.createActivity = catchAsyncError(async (req, res, next) => {
    const {
        name, shortdescription, price, rating, description, keyinstructions, reservationpolicy, benifits,
        duration, cancellation, groupsize, languages, highlights, included, excluded, categorey
    } = req.body;

    const files = req.files; // Note the use of req.files instead of req.file

    const imagePromises = files.map(async (file) => {
        const fileUri = getDataUri(file);
        const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
        return { public_id: mycloud.public_id, url: mycloud.secure_url };
    });

    const uploadedImages = await Promise.all(imagePromises);

    const newActivity = await Activity.create({
        name, shortdescription, price, rating, description, keyinstructions, reservationpolicy, benifits,
        duration, cancellation, groupsize, languages, highlights, included, excluded, categorey,
        images: uploadedImages // Assign the uploaded images to the images field
    });

    res.status(201).json({
        status: 'success',
        message: 'Successfully created',
        data: {
            activity: newActivity
        }
    });
});


exports.getAllActivities = catchAsyncError(async (req, res, next) => {
    const keyword = req.query.keyword;
    let activities;

    if (!keyword) {
        activities = await Activity.find();
    } else {
        activities = await Activity.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { shortdescription: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        });
    }

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
    const activityId = req.params.id;
    const {
        name, shortdescription, price,  description, keyinstructions, reservationpolicy, benifits,
        duration, cancellation, groupsize, languages, highlights, included, excluded, categorey
    } = req.body;

    // Check if the activity exists
    const existingActivity = await Activity.findById(activityId);
    if (!existingActivity) {
        return next(new ErrorHandler("Activity not found", 404));
    }

    // Upload new images if provided
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
        const imagePromises = req.files.map(async (file) => {
            const fileUri = getDataUri(file);
            const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
            return { public_id: mycloud.public_id, url: mycloud.url };
        });
        uploadedImages = await Promise.all(imagePromises);
    }

    // Update activity fields
    existingActivity.name = name;
    existingActivity.shortdescription = shortdescription;
    existingActivity.price = price;
    existingActivity.description = description;
    existingActivity.keyinstructions = keyinstructions;
    existingActivity.reservationpolicy = reservationpolicy;
    existingActivity.benifits = benifits;
    existingActivity.duration = duration;
    existingActivity.cancellation = cancellation;
    existingActivity.groupsize = groupsize;
    existingActivity.languages = languages;
    existingActivity.highlights = highlights;
    existingActivity.included = included;
    existingActivity.excluded = excluded;
    existingActivity.categorey = categorey;

    // Update images if new images were uploaded
    if (uploadedImages.length > 0) {
        existingActivity.images = uploadedImages;
    }

    const updatedActivity = await existingActivity.save();

    res.status(200).json({
        status: 'success',
        data: {
            activity: updatedActivity
        }
    });
});



exports.deleteActivityById = catchAsyncError(async (req, res, next) => {
    const activityId = req.params.id;

    // Find and delete the activity by ID
    const deletedActivity = await Activity.findOneAndDelete({ _id: activityId });

    if (!deletedActivity) {
        return res.status(404).json({
            status: 'error',
            message: 'Activity not found'
        });
    }

    // Delete images from Cloudinary
    const imagePublicIds = deletedActivity.images.map(image => image.public_id);
    if (imagePublicIds.length > 0) {
        await Promise.all(imagePublicIds.map(async (publicId) => {
            await cloudinary.v2.uploader.destroy(publicId);
        }));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});



exports.createActivityReview = catchAsyncError(async (req, res, next) => {
    // Extract rating, comment, and activityId from the request body
    const { rating, comment } = req.body;
    const {id} = req.params;
    // Create a review object with user's information and review details
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };

    // Fetch the activity using the provided activityId
    const activity = await Activity.findById(id);

    // Check if the current user has already reviewed the activity
    const isReviewed = activity.reviews.find((rev) => rev.user.toString() === req.user._id.toString());

    // If the user has reviewed the activity before
    if (isReviewed) {
        // Update the existing review's rating and comment
        activity.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else {
        // If it's a new review, push it into the reviews array
        activity.reviews.push(review);
        activity.noOfReviews = activity.reviews.length;
    }

    // Calculate the average rating for the activity
    let avg = 0;
    activity.reviews.forEach((rev) => {
        avg += rev.rating;
    });
    activity.ratings = avg / activity.reviews.length;

    // Save the updated activity to the database, skipping validation
    await activity.save({
        validateBeforeSave: false
    });

    // Send a successful response with status 200 and a success flag
    res.status(200).json({
        success: true
    });
});



exports.getAllRevirews = catchAsyncError(async (req, res, next) => {
    const {activityId} = req.params;
    const activity = await Activity.findById(activityId);
    if (!activity) {
        return next(new ErrorHandler("activity not found", 404))
    }
    res.status(200).json({
        success: true,
        data: activity.reviews
    })
})


exports.deleteActivityReview = catchAsyncError(async (req, res, next) => {
    const { activityId, reviewId } = req.params;

    // Find the activity by its ID
    const activity = await Activity.findById(activityId);

    // Find the index of the review to be deleted
    const reviewIndex = activity.reviews.findIndex((rev) => rev._id.toString() === reviewId);

    // If the review is found
    if (reviewIndex !== -1) {
        // Check if the review belongs to the current user
        if (activity.reviews[reviewIndex].user.toString() === req.user._id.toString()) {
            // Remove the review from the reviews array
            activity.reviews.splice(reviewIndex, 1);
            activity.noOfReviews = activity.reviews.length;

            // Recalculate the average rating
            let avg = 0;
            activity.reviews.forEach((rev) => {
                avg += rev.rating;
            });
            activity.ratings = avg / activity.reviews.length;

            // Save the updated activity
            await activity.save({
                validateBeforeSave: false
            });

            // Send a success response
            return res.status(200).json({
                success: true
            });
        } else {
            // If the review does not belong to the current user
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this review."
            });
        }
    } else {
        // If the review is not found
        return res.status(404).json({
            success: false,
            message: "Review not found."
        });
    }
});
