// Require Mongoose
const mongoose = require("mongoose");

// Require all Models
const User = require("./user");
const Event = require("./event");
const Discussion = require("./discussion");

// DB Config File
const config = require("../config");


// Promise
mongoose.Promise = global.Promise;


// Connect to MongoDB Database
mongoose.connect(`mongodb://${config.DB.HOST}:${config.DB.PORT}/${config.DB.NAME}`, {
    useMongoClient: true
}).then(() => {
    console.log("Database Ready for use!");
}).catch((err) => {
    console.log(`Error starting Database: ${err}`)
});

module.exports = {User, Event, Discussion};

User.create({
    name: "Anuj Aggarwal"
});
Event.create({
    name: "Event"
});