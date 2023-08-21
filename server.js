const app = require('./app');
const databaseConnection = require('./config/database');

databaseConnection();

app.listen(process.env.PORT, () => {
    console.log(`Server is connected on : http://localhost:${process.env.PORT}`)
})