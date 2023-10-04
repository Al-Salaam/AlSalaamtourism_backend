const Mailgen = require("mailgen");

const generateInquiryEmailContent = (user, package, travelDate, otherDetails) => {
    const mailGenerator = new Mailgen({
        theme: {
            palette: {
                primary: '#007bff',
                secondary: '#6c757d',
                muted: '#f8f9fa',
                success: '#28a745',
                danger: '#dc3545',
                warning: '#ffc107',
                info: '#17a2b8',
            },
            font: {
                family: 'Arial, sans-serif',
            },
            table: {
                body: {
                    cellBorder: '1px solid #dee2e6',
                    cellPadding: 10,
                    fontSize: '16px',
                },
                head: {
                    cellBorder: '1px solid #007bff',
                    cellPadding: 10,
                    fontSize: '18px',
                    color: '#ffffff',
                    backgroundColor: '#007bff',
                },
            },
        },
        product: {
            // Your product details
            name: 'Al Salaam Tourism',
            link: 'https://yourtravelservice.com',
            // Optional logo
            // logo: 'https://yourtravelservice.com/logo.png',
        },
    });

    const data = [
        { key: 'User Name:', value: user.name},
        { key: 'Package ID#:', value: package._id },
        { key: 'Package Name:', value: package.heading },
        { key: 'Travel Date:', value: travelDate },
        // Add other inquiry details here
        ...otherDetails.map(detail => ({
            key: detail.key,
            value: detail.value,
        }))
    ];

    // Filter out entries with undefined or null values
    const filteredData = data.filter(detail => detail.value !== undefined && detail.value !== null);

    const email = {
        body: {
            name: 'New Inquiry Created',
            intro: 'Hello,',
            table: {
                data: filteredData,
            },
            outro: 'Thank you!',
        },
    };

    // Generate the email content (HTML version)
    const emailBodyHtml = mailGenerator.generate(email);

    // Generate the email content (Plaintext version)
    const emailBodyPlainText = mailGenerator.generatePlaintext(email);

    return { html: emailBodyHtml, plaintext: emailBodyPlainText };
};

module.exports = generateInquiryEmailContent;
