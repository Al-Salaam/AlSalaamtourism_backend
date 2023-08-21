const mongoose = require('mongoose');

const databaseConnection = () => {
    mongoose.connect(process.env.MONGO_URL)
    .then((con) => {
        console.log(`Database connected successfully: ${con.connection.host}`)
    })
    .catch((error) => {
        console.log(error)
    })
}

module.exports = databaseConnection;