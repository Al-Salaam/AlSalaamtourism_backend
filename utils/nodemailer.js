const nodemailer = require('nodemailer');

function createTransporter() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'alsalaampakistan@gmail.com', // your Gmail email address
            pass: 'emafawcytlepuzik' // your Gmail password
        }
    });

    return transporter;
}

module.exports = createTransporter;
