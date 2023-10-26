const { catchAsyncError } = require('../middlewares/catchAsyncError');
const Inquiry = require('../models/Inquiry');
const Pakage = require('../models/Pakage');
const ErrorHandler = require('../utils/errorHandler');
const createTransporter = require('../utils/nodemailer');
const Mailgen = require('mailgen');

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Al Salaam Tourism',
    link: 'https://your-travel-agency.com',
    // You can customize product information here
  },
});
exports.createInquiry = catchAsyncError(async (req, res, next) => {
  
    // Create an inquiry for the package
    const {
      title,
      firstname,
      lastname,
      email,
      phone,
      nationality,
      specialRequirment
    } = req.body;
    const userId = req.user._id; // Assuming you have authentication middleware
  const packageId = req.params.packageId; // Assuming you have this parameter in your route

    // const user = await User.findById(userId);
    // Check if the provided package ID exists
    const package = await Pakage.findById(packageId);
    if (!package) {
      return next(new ErrorHandler("package not found", 404));
    }

  

    const inquiry = await Inquiry.create({
      title,
      firstname,
      lastname,
      email,
      phone,
      nationality,
      specialRequirment,
      packages: packageId,
      user: userId,
      status: 'pending',
    });

  // Send an email notification using Mailgen and nodemailer
  const emailBody = {
    body: {
      name: `${firstname} ${lastname}`,
      intro: 'Thank you for your inquiry at Your Alsalaam Toursim',
      action: {
        instructions: 'You can track the status of your inquiry by visiting our website.',
        button: {
          color: '#22BC66',
          text: 'View Inquiry Status',
          link: 'https://your-travel-agency.com/inquiries',
        },
      },
      outro: 'We appreciate your interest in our services.',
    },
  };

  const emailContent = mailGenerator.generate(emailBody);
  const emailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: 'Your Travel Inquiry Confirmation',
    html: emailContent,
  };

  const transporter = createTransporter();
  await transporter.sendMail(emailOptions);

    res.status(201).json({
      success: true,
      message: 'Inquiry created successfully',
      inquiry,
    });
  
});



// Create a new inquiry for admin
exports.createInquiryForAdmin = catchAsyncError(async (req, res, next) => {
  const newInquiry = new Inquiry(req.body);
  await newInquiry.save();

  res.status(201).json({
    success: true,
    message: 'Created Successfully',
  });
});

// Get all inquiry history for a user
exports.getAllInquiryHistory = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id; // Assuming you have authentication middleware

  const inquiries = await Inquiry.find({ user: userId }).populate('packages');

  res.status(200).json({
    success: true,
    inquiries,
  });
});

// Get all inquiries for admin with pagination
exports.adminGetAllInquiry = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const inquiries = await Inquiry.find()
    .populate('packages')
    .populate('user')
    .skip(skip)
    .limit(limit);

  const totalCount = await Inquiry.countDocuments();
  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    success: true,
    data: {
      inquiries,
      page,
      totalPages,
      totalCount,
    },
  });
});

// Get an inquiry by ID for admin
exports.getInquiryById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const inquiry = await Inquiry.findById(id).populate('packages').populate('user');

  if (!inquiry) {
    return next(new ErrorHandler("inquiry not found", 404));
  }

  res.status(200).json({
    success: true,
    inquiry,
  });
});

// Update an inquiry's status for admin
exports.updateInquiryById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const updatedInquiryData = req.body;

  const updatedInquiry = await Inquiry.findByIdAndUpdate(id, updatedInquiryData, {
    new: true,
    runValidators: true,
  });

  if (!updatedInquiry) {
    return next(new ErrorHandler("inquiry not found", 404));
  }

  res.status(200).json({
    success: true,
    message: 'Updated Successfully',
  });
});

// Delete an inquiry for admin
exports.deleteInquiry = catchAsyncError(async (req, res, next) => {
  const inquiryId = req.params.id;

  const deletedInquiry = await Inquiry.findOneAndDelete({ _id: inquiryId });

  if (!deletedInquiry) {
    return next(new ErrorHandler("inquiry not found", 404));
  }

  res.status(200).json({
    success: true,
    message: 'Inquiry deleted successfully',
  });
});
