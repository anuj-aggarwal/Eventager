// Create Router
const route = require('express').Router();

// Require Models
const models = require("../../models");

const { checkAPILoggedIn } = require("../../utils/auth");

// POST Route for Replying to a comment
route.post('/', checkAPILoggedIn, (req,res)=>{
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
route.patch('/:id', checkAPILoggedIn, (req,res)=>{
    // Find the comment and update the body of comment
    models.Comment.findOneAndUpdate({
        _id: req.params.id,
        user: req.user._id
    }, {
        body: req.body.body
    })
        .then(comment => {
            // Comment not found or user is wrong
            if (comment === null) {
                return res.status(404).send("No such Comment found for current user");
            }
            // Send the new comment to user
            res.send(comment);
        })
        .catch((err)=>{
            console.log(err);
        });
});


// DELETE Request for deleting a comment
route.delete('/:id', checkAPILoggedIn, (req, res)=>{
    // Find the comment and delete it
    models.Comment.findOneAndRemove({
        _id: req.params.id,
        user: req.user._id
    })
        .then((comment)=>{
            // Send the deleted comment to the user
            console.log("Deleted: " + comment);
            res.send(comment);
        })
        .catch((err)=>{
            console.log(err);
        });
});


// PATCH Request to Edit a Reply Text
route.patch('/:id/replies/:replyId', checkAPILoggedIn, (req, res)=>{
    // Find the Comment to be edited
   models.Comment.findById(req.params.id)
        .then((comment)=>{
            if (comment === null) {
                return res.status(404).send("Comment not found!");
            }
            // Find the reply to be edited
            const reply = comment.replies.find(reply => reply._id.equals(req.params.replyId));
            if (!reply)
                return res.status(404).send("No Such Reply Found in the Comment!");
            
            if (!reply.user.equals(req.user._id)) {
                return res.status(401).send("Cannot Edit other user's Posts");
            }
            reply.body = req.body.body;

            return comment.save()
                .then(()=>{
                    // Populate the user
                    return models.Comment.populate(reply, 'user');
                });
        })
        .then((comment)=>{
            // Send the comment with updated reply to user
            if (!res.headersSent)
                res.send(comment);
        })
        .catch((err)=>{
            console.log(err);
        });
});


// DELETE Request to Delete a Reply Text
route.delete('/:id/replies/:replyId', checkAPILoggedIn, (req, res)=>{
    // Find the Comment to be edited
    models.Comment.findById(req.params.id)
        .then((comment)=>{
            if (comment === null) {
                return res.status(404).send("Comment not found!");
            }

            // Find the reply to be edited
            const replyIndex = comment.replies.findIndex(reply => reply._id.equals(req.params.replyId));
            if (replyIndex === -1) {
                return res.status(404).send("Reply not found!");
            }
            if (!comment.replies[replyIndex].user.equals(req.user._id)) {
                return res.status(401).send("Cannot delete other user's reply!");
            }

            // If current reply is required reply
            comment.replies.splice(replyIndex, 1);
            return comment.save()
                .then(()=>{
                    // Send Deleted Reply to user
                    return res.send(comment.replies[replyIndex]);
                });
        })
        .catch((err)=>{
            console.log(err);
        });
});

// Export the Router
module.exports = route;