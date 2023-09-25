
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

// for the admin 
exports.createInquiryForAdmin = catchAsyncError(async (req, res, next) => {
    const {
        travelDate,
        numberOfRooms,
        totalDaysOfVisit,
        travellersNationality,
        durationOrNightStays,
        preferSingleOrDoubleOccupancy,
        numberOfAdults,
        numberOfChildren,
        selectedHotel,
        preferMealSelection,
        excursionSelection,
        covid19VaccineDoses,
        packages,
        user,
        status,
    } = req.body;

    // Create a new inquiry document
    const newInquiry = new Inquiry({
        travelDate,
        numberOfRooms,
        totalDaysOfVisit,
        travellersNationality,
        durationOrNightStays,
        preferSingleOrDoubleOccupancy,
        numberOfAdults,
        numberOfChildren,
        selectedHotel,
        preferMealSelection,
        excursionSelection,
        covid19VaccineDoses,
        packages,
        user,
        status,
    });

    // Save the new inquiry document to the database
    await newInquiry.save();

    // Respond with the newly created inquiry document
    res.status(201).json({
        success: true,
        message: 'created Successfully'
    });
})

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

exports.adminGetAllInquiry = catchAsyncError(async (req, res, next) => {
    // Get the page and limit from query parameters or set default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Adjust the default limit as needed

    // Calculate the number of documents to skip based on the page and limit
    const skip = (page - 1) * limit;

    // Query the database with pagination
    const inquiries = await Inquiry.find()
        .populate('packages')
        .populate('user')
        .skip(skip)
        .limit(limit);

    // Get the total count of inquiries (without pagination)
    const totalCount = await Inquiry.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({
        success: true,
        data: {
            inquiries,
            page, 
            totalPages,
            totalCount
        }
    });
});

// admin get inquiries by id

exports.getInquiryById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
  
    const inquiry = await Inquiry.findById(id).populate('packages').populate('user');
  
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }
  
    res.status(200).json({
      success: true,
        inquiry,
    });
  });
  

// admin can update the inquiry status



exports.updateInquiryById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
  
    const {
      travelDate,
      numberOfRooms,
      totalDaysOfVisit,
      travellersNationality,
      durationOrNightStays,
      preferSingleOrDoubleOccupancy,
      numberOfAdults,
      numberOfChildren,
      selectedHotel,
      preferMealSelection,
      excursionSelection,
      covid19VaccineDoses,
      packages,
      user,
      status,
    } = req.body;
  
    // Create an object with the updated inquiry data
    const updatedInquiryData = {
      travelDate,
      numberOfRooms,
      totalDaysOfVisit,
      travellersNationality,
      durationOrNightStays,
      preferSingleOrDoubleOccupancy,
      numberOfAdults,
      numberOfChildren,
      selectedHotel,
      preferMealSelection,
      excursionSelection,
      covid19VaccineDoses,
      packages,
      user,
      status,
    };
  
    const updatedInquiry = await Inquiry.findByIdAndUpdate(id, updatedInquiryData, {
      new: true,
      runValidators: true,
    });
  
    if (!updatedInquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }
  
    res.status(200).json({
      success: true,
      message: 'Update Successfully'
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