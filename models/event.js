// Require Mongoose
const mongoose = require("mongoose");


// Create Schema for Event
const eventSchema = mongoose.Schema({
    name: String,
    description: String,
    category: String,
    tags: [String],
    ticketPrice: Number,
    dateTime: Date,
    duration: Number,
    venue: String,
    organizers: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: "user"
    }],
    peopleAttending: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    discussion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "discussion"
    }
});

// Create and export Event model
module.exports = mongoose.model("event", eventSchema);