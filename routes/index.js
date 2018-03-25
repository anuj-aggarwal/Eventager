const express = require("express");
const path = require("path");

// Create the Router
const route = express.Router();

// Serve static files at root
route.use('/', express.static(path.join(__dirname, '../public_static')));

// GET Request for Index Page
route.get('/', (req,res)=>{
    res.render('index');
});

// Sub Routes
route.use("/", require("./auth"));
route.use("/api", require("./api"));
route.use("/events", require('./event'));


// Export the Router
module.exports = route;