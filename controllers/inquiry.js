
const { catchAsyncError } = require('../middlewares/catchAsyncError');
const Inquiry = require('../models/Inquiry');
const Pakage = require('../models/Pakage');


exports.createInquiry = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id; // Assuming you have authentication middleware
    const packageId = req.params.packageId; // Assuming you have this parameter in your route

    // Check if the provided package ID exists
    const package = await Pakage.findById(packageId);
    if (!package) {
        return res.status(404).json({
            success: false,
            message: 'Package not found'
        });
    }

    // Create an inquiry for the package
    const inquiry = await Inquiry.create({
        user: userId,
        packages: packageId,
        ...req.body // Assuming the request body contains other inquiry details
    });

    res.status(201).json({
        success: true,
        message: 'Inquiry created successfully',
        inquiry
    });
});


exports.getAllInquiryHistory = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id; // Assuming you have authentication middleware

    // Find all inquiries for the user
    const inquiries = await Inquiry.find({ user: userId }).populate('packages');

    res.status(200).json({
        success: true,
        inquiries
    });
});

// admin get all inquiry

exports.adminGetAllInquiry = catchAsyncError(async(req, res, next)=>{
    const inquiries = await Inquiry.find().populate('packages');
    res.status(200).json({
        success: true,
        data: inquiries
    })
})


// admin can update the inquiry status



exports.updateInquiryStatus = catchAsyncError(async (req, res, next) => {
    const inquiryId = req.params.id; // Assuming you have this parameter in your route

    // Find the inquiry by ID
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
        return res.status(404).json({
            success: false,
            message: 'Inquiry not found'
        });
    }

    // Update the inquiry status
    const newStatus = req.body.status;
    if (!newStatus) {
        return res.status(400).json({
            success: false,
            message: 'Status field is required'
        });
    }

    inquiry.status = newStatus;
    await inquiry.save();

    res.status(200).json({
        success: true,
        message: 'Inquiry status updated successfully',
        inquiry
    });
});

exports.deleteInquiry = catchAsyncError(async (req, res, next) => {
    const inquiryId = req.params.id; // Assuming you have this parameter in your route

    // Find and delete the inquiry by ID
    const deletedInquiry = await Inquiry.findOneAndDelete({ _id: inquiryId });

    if (!deletedInquiry) {
        return res.status(404).json({
            success: false,
            message: 'Inquiry not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Inquiry deleted successfully'
    });
});