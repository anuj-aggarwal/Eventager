// Require Mongoose
const mongoose = require("mongoose");


// Create Schema for Comment
const commentSchema = mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    },
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
        body: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    usePushEach: true   // UsePushEach to use $pushEach instead of deprecated $pushAll
});

// Create and export Comment model
module.exports = mongoose.model("comment", commentSchema);