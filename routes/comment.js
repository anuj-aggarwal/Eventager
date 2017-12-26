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

// PATCH Request for updating a comment's Body
route.patch('/:id', (req,res)=>{
    // Find the comment and update the body of comment
    models.Comment.findByIdAndUpdate(req.params.id, {
        body: req.body.body
    })
    .then((comment)=>{
        // Send the new comment to user
        res.send(comment);
    })
    .catch((err)=>{
        console.log(err);
    })
});

// DELETE Request for deleting a comment
route.delete('/:id', (req, res)=>{
    // Find the comment and delete it
    models.Comment.findByIdAndRemove(req.params.id)
        .then((comment)=>{
            // Send the deleted comment to the user
            console.log("Deleted: " + comment);
            res.send(comment);
        })
        .catch((err)=>{
            console.log(err);
        })
});

route.patch('/:id/replies/:replyId', (req, res)=>{
    // Find the Comment to be edited
   models.Comment.findById(req.params.id)
       .then((comment)=>{
            // Find the reply to be edited
            comment.replies.forEach((reply)=>{
                if(reply._id.toString() === req.params.replyId){
                    // If current reply is required reply
                    reply.body = req.body.body;
                    comment.save()
                    .then((comment)=>{
                        // Populate the user
                        return models.Comment.populate(reply, 'user');
                    })
                }
            });
       })
        .then((comment)=>{
            // Send the comment with updated reply to user
            res.send(comment);
       })
       .catch((err)=>{
            console.log(err);
       })
});

// Export the Router
module.exports = route;