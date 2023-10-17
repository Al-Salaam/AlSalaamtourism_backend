const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Mailgen = require("mailgen");
const createTransporter = require("../utils/nodemailer");
const mailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Al Salaam Tourism",
        link: "https://your-app-url.com",
    },
});

exports.contactus = catchAsyncError(async (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;
    
    // Generate an HTML email using mailgen
    const emailTemplate = {
        body: {
            name: "Admin",
            intro: "You have a new contact form submission:",
            table: {
                data: [
                    {
                        item: "Name:",
                        description: `${firstName} ${lastName}`,
                    },
                    {
                        item: "Email:",
                        description: email,
                    },
                    {
                        item: "Phone:",
                        description: phone,
                    },
                    {
                        item: "Message:",
                        description: message,
                    },
                ],
            },
            
        },
    };

    // Generate an HTML email from the template
    const emailBody = mailGenerator.generate(emailTemplate);
    const mailOptions = {
        from: email, // Sender's email address
        to: process.env.ADMIN_EMAIL, // Admin's email address
        subject: "New Contact Form Submission",
        html: emailBody,
    };


    // Send email using nodemailer
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
})