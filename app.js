const express = require('express');
const dotenv = require("dotenv");
const morgan = require('morgan');
const  app = express();

dotenv.config({
    path:'./config/config.env'
});

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(morgan('tiny'));

module.exports = app;