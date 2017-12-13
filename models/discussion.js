// Require Mongoose
const mongoose = require("mongoose");


// Create Schema for Discussion
const discussionSchema = mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        body: String,
        replies: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            body: String
        }]
    }]
});

// Create and export Discussion model
module.exports = mongoose.model("discussion", discussionSchema);