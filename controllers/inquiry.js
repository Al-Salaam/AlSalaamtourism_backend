
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
