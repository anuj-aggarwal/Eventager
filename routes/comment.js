// Create Router
const route = require('express').Router();

// Require Models
const models = require("../models");


// POST Route for Replying to a comment
route.post('/', (req,res)=>{
    // Find the required comment
    models.Comment.findById(req.body.commentId)
    .then((comment)=>{
        // Add the reply to comment and save it
        comment.replies.push({
            user: req.user,
            body: req.body.body
        });
        return comment.save();
    })
    .then((comment)=>{
        // Populate the reply(only last) with user
        return models.Comment.populate(comment.replies[comment.replies.length - 1], 'user');
    })
    .then((reply)=>{
        // Send the last reply to user
        res.send(reply);
    })
    .catch((err)=>{
        console.log(err);
    });
});


// Export the Router
module.exports = route;