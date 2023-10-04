
const generateInquiryEmailContent = require('../utils/emailtemplate/generateInquiryEmailContent');
const { catchAsyncError } = require('../middlewares/catchAsyncError');
const Inquiry = require('../models/Inquiry');
const Pakage = require('../models/Pakage');
const User = require('../models/User');
const createTransporter = require('../utils/nodemailer');


exports.createInquiry = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id; // Assuming you have authentication middleware
  const packageId = req.params.packageId; // Assuming you have this parameter in your route
  const user = await User.findById(userId);
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
  // for the email 
  const userIdforemail = user;
  const packageforemail = package;
  const travelDate = req.body.travelDate; // Assuming 'travelDate' is in the request body
  const otherDetails = [
    { key: 'Number of Rooms:', value: req.body.numberOfRooms },
    { key: 'Total Days of Visit:', value: req.body.totalDaysOfVisit },
    { key: 'Travellers Nationality:', value: req.body.travellersNationality },
    { key: 'Duration or Night Stays:', value: req.body.durationOrNightStays },
    { key: 'Prefer Single or Double Occupancy:', value: req.body.preferSingleOrDoubleOccupancy },
    { key: 'Number of Adults:', value: req.body.numberOfAdults },
    { key: 'Number of Children:', value: req.body.numberOfChildren },
    { key: 'Selected Hotel:', value: req.body.selectedHotel },
    { key: 'Preferred Meal Selection:', value: req.body.preferMealSelection },
    { key: 'Excursion Selection:', value: req.body.excursionSelection },
    { key: 'COVID-19 Vaccine Doses:', value: req.body.covid19VaccineDoses },
    { key: 'Inquiry Status', value: req.body.status },
  ];

  // Generate the email content
  const emailContent = generateInquiryEmailContent(userIdforemail, packageforemail, travelDate, otherDetails);

  // Send email notification
  const mailOptions = {
    from: process.env.ADMIN_EMAIL, // sender address
    to: user.email, // list of receivers
    subject: 'Packages Inquiry', // Subject line
    text: emailContent.plaintext, // Plain text version of the email
    html: emailContent.html, // HTML version of the email
  };
  const transporter = createTransporter();
  await transporter.sendMail(mailOptions);

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