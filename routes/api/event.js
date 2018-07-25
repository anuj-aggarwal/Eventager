// Create Router
const route = require('express').Router();

// Require Models
const models = require("../../models");

const { checkAPILoggedIn } = require("../../utils/auth");


// GET Route for events
route.get('/', (req,res)=>{
    let sortBy;
    switch (req.query.sortBy) {
    case "trending":
        sortBy = "numPeopleAttending";
        break;
    case "recent":
        sortBy = "dateTime";
        break;

    default:
        sortBy = "createdAt";
        break;
    }

    // Get all the events
    models.Event.find()
        .sort([[sortBy, -1], ["createdAt", -1]])
        .skip(parseInt(req.query.skip))
        .limit(parseInt(req.query.count))
        .then((events)=>{
            // Send all events to user
            res.send(events);
        })
        .catch((err)=>{
            console.log(err);
<<<<<<< HEAD
        })
    }
=======
        });
>>>>>>> develop
});


// Get Route for all Comments of an event
route.get('/:id/comments', (req, res) => {
    // Find comments with the event id in params
    // Send comments after skipping 'skip' comments
    // Sen 'limit' comments
    models.Comment.find({
        event: req.params.id
    })
        .sort([["createdAt", "descending"]])
        .skip(parseInt(req.query.skip))
        .limit(parseInt(req.query.count))
        // Populate the User and Replies' user in comment
        .populate('user')
        .populate('replies.user')
        .then((comments) => {
            if (comments === null)
                return res.send([]);
            comments.forEach(comment => comment.replies.sort((a, b) => (new Date(b.createdAt) - new Date(a.createdAt))));
            // Send comments to user
            res.send(comments);
        })
        .catch((err) => {
            console.log(err);
        });
});


// Post Route for creating new comment to Event(not to another comment)
route.post('/:id/comments', checkAPILoggedIn, (req, res) => {
    // Create new comment with specified details
    models.Comment.create({
        body: req.body.body,
        event: req.params.id,
        user: req.user._id
    })
        .then((comment) => {
            // Find the Current Event
            models.Event.findById(req.params.id).then((event) => {
                // Add the comment to Event's Comments
                event.comments.push(comment);
                return event.save();
            })
                .then((event) => {
                    // Find the newly added comment populated with user
                    models.Comment.findById(comment._id)
                        .populate('user')
                        .then((comment) => {
                            // Send the new comment to user
                            res.send(comment);
                        })
                })
        })
        .catch((err) => {
            console.log(err);
        })
});


route.post('/:id/organizers', (req, res) => {
    models.Event.findById(req.params.id)
        .then((event) => {
            return models.User.findOne({
                username: req.body.username
            })
                .then((user) => {
                    if (!user) return new Error("No such Username exists!");
                    if (event.organizers.findIndex(organizer => user._id.equals(organizer)) != -1)
                        res.send({ err: "User already exists" });
                    else
                        event.organizers.push(user._id);
                    return event.save();
                });
        })
        .then(event => {
            return event.populate("organizers").execPopulate();
        })
        .then((nevent) => {
            let length = nevent.organizers.length;
            if (!res.headersSent)
                res.send({ organizer: nevent.organizers[length - 1].name });
        })
        .catch(err => console.log(err));
});


// Export the Router
module.exports = route;