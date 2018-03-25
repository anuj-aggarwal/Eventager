// Create the Router
const route = require("express").Router();

// Sub Routes
route.use("/events", require('./event'));
route.use("/comments", require('./comment'));


// Export the Router
module.exports = route;