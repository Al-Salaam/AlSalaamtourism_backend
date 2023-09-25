const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Pakage = require("../models/Pakage");
const getDataUri = require("../utils/dataUri");
const cloudinary = require('cloudinary');
const ErrorHandler = require("../utils/errorHandler");
exports.createPakage = catchAsyncError(async (req, res, next) => {
    const {
        heading, description, keyIntructions, cancellationguide, childpolicy,
        tourbenifits, duration, cancellation, groupsize, languages
    } = req.body;

    const files = req.files; // Note the use of req.files instead of req.file

    const imagePromises = files.map(async (file) => {
        const fileUri = getDataUri(file);
        const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
        return { public_id: mycloud.public_id, url: mycloud.secure_url };
    });

    const uploadedImages = await Promise.all(imagePromises);

    const newPakage = await Pakage.create({
        heading, description, keyIntructions, cancellationguide, childpolicy,
        tourbenifits, duration, cancellation, groupsize, languages,
        images: uploadedImages // Assign the uploaded images to the images field
    });

    res.status(201).json({
        status: 'success',
        message: 'Successfully created',
        data: {
            pakage: newPakage
        }
    });
});

exports.getAllPakages = catchAsyncError(async (req, res, next) => {
    const pakages = await Pakage.find();
    res.status(200).json({
        success: true,
        data:{
            pakages
        }
    })
})


exports.getPakageById = catchAsyncError(async(req, res, next) => {
    const pakage = await Pakage.findById(req.params.id);
    if(!pakage){
        return next(new ErrorHandler('pakage not found'))
    }
    res.status(200).json({
        success: true,
        pakage
    })
})

exports.updatePakageById = catchAsyncError(async (req, res, next) => {
    const pakageId = req.params.id;
    const {
        heading, description, keyIntructions, cancellationguide, childpolicy,
        tourbenifits, duration, cancellation, groupsize, languages
    } = req.body;

    // Check if the pakage exists
    const existingPakage = await Pakage.findById(pakageId);
    if (!existingPakage) {
        return next(new ErrorHandler("Pakage not found", 404));
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

    // Update pakage fields
    existingPakage.heading = heading;
    existingPakage.description = description;
    existingPakage.keyIntructions = keyIntructions;
    existingPakage.cancellationguide = cancellationguide;
    existingPakage.childpolicy = childpolicy;
    existingPakage.tourbenifits = tourbenifits;
    existingPakage.duration = duration;
    existingPakage.cancellation = cancellation;
    existingPakage.groupsize = groupsize;
    existingPakage.languages = languages;

    // Update images if new images were uploaded
    if (uploadedImages.length > 0) {
        existingPakage.images = uploadedImages;
    }

    const updatedPakage = await existingPakage.save();

    res.status(200).json({
        status: 'success',
        message: "Updated Successfully",
        data: {
            pakage: updatedPakage
        }
    });
});


exports.deletePakageById = catchAsyncError(async (req, res, next) => {
    const pakageId = req.params.id;

    // Check if the pakage exists
    const existingPakage = await Pakage.findById(pakageId);
    if (!existingPakage) {
        return res.status(404).json({
            status: 'error',
            message: 'Pakage not found'
        });
    }

    // Delete images from Cloudinary
    const imagePublicIds = existingPakage.images.map(image => image.public_id);
    if (imagePublicIds.length > 0) {
        await Promise.all(imagePublicIds.map(async (publicId) => {
            await cloudinary.v2.uploader.destroy(publicId);
        }));
    }

    // Delete the pakage from the database
    await existingPakage.deleteOne();

    res.status(200).json({
        status: 'success',
        message: "Successfully deleted"
    });
});

exports.createPakageReview = catchAsyncError(async (req, res, next) => {
    // Extract rating, comment, and pakageId from the request body
    const { rating, comment } = req.body;
    const { id } = req.params;

    // Create a review object with user's information and review details
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };

    // Fetch the pakage using the provided pakageId
    const pakage = await Pakage.findById(id);

    // Check if the current user has already reviewed the pakage
    const isReviewed = pakage.reviews.find((rev) => rev.user.toString() === req.user._id.toString());

    // If the user has reviewed the pakage before
    if (isReviewed) {
        // Update the existing review's rating and comment
        pakage.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else {
        // If it's a new review, push it into the reviews array
        pakage.reviews.push(review);
        pakage.noOfReviews = pakage.reviews.length;
    }

    // Calculate the average rating for the pakage
    let avg = 0;
    pakage.reviews.forEach((rev) => {
        avg += rev.rating;
    });
    pakage.ratings = avg / pakage.reviews.length;

    // Save the updated pakage to the database, skipping validation
    await pakage.save({
        validateBeforeSave: false
    });

    // Send a successful response with status 200 and a success flag
    res.status(200).json({
        success: true
    });
});

exports.getAllPakageReviews = catchAsyncError(async (req, res, next) => {
    const {id} = req.params;
    const pakage = await Pakage.findById(id);
    if(!pakage){ 
        return next(new ErrorHandler("pakage not found", 404))
    }
    res.status(200).json({
        success: true,
        data: pakage.reviews
    })
})


exports.deletePakageReview = catchAsyncError(async (req, res, next) => {
    const { pakageId, reviewId } = req.params;
    
    // Find the pakage by its ID
    const pakage = await Pakage.findById(pakageId);
    
    // Find the index of the review to be deleted
    const reviewIndex = pakage.reviews.findIndex((rev) => rev._id.toString() === reviewId);
    
    // If the review is found
    if (reviewIndex !== -1) {
        // Check if the review belongs to the current user
        if (pakage.reviews[reviewIndex].user.toString() === req.user._id.toString()) {
            // Remove the review from the reviews array
            pakage.reviews.splice(reviewIndex, 1);
            pakage.noOfReviews = pakage.reviews.length;

            // Recalculate the average rating
            let avg = 0;
            pakage.reviews.forEach((rev) => {
                avg += rev.rating;
            });
            pakage.ratings = avg / pakage.reviews.length;

            // Save the updated pakage
            await pakage.save({
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