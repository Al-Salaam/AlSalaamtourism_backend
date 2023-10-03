const app = require('./app');
const databaseConnection = require('./config/database');
const cloudinary = require('cloudinary');


databaseConnection();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.listen(process.env.PORT, () => {
    console.log(`Server is connected on : http://localhost:${process.env.PORT}, is on ${process.env.NODE_ENV}`)
})