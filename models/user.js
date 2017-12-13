// Require Mongoose
const mongoose = require("mongoose");


// Create Schema for User
const userSchema = mongoose.Schema({
    username: String,
    name: String,
    phoneNumber: String,
    password: String,
    email: String,
    eventsOrganizing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    },
    eventsAttending: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    }
});

// Create and export User model
module.exports = mongoose.model("user", userSchema);