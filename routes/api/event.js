// Create Router
const route = require('express').Router();

// Require Models
const models = require("../../models");

const { checkAPILoggedIn } = require("../../utils/auth");

// GET Route for events
route.get('/', (req,res)=>{
    // Get all the events
    models.Event.find()
        .skip(parseInt(req.query.skip))
        .limit(parseInt(req.query.count))
        .then((events)=>{
            // Send all events to user
            res.send(events);
        })
        .catch((err)=>{
            console.log(err);
        })
});


// Get Route for all Comments of an event
route.get('/:id/comments', (req, res) => {
    // Find comments with the event id in params
    // Send comments after skipping 'skip' comments
    // Sen 'limit' comments
    models.Comment.find({event: req.params.id})
        .skip(parseInt(req.query.skip))
        .limit(parseInt(req.query.count))
        // Populate the User and Replies' user in comment
        .populate('user')
        .populate('replies.user')
        .then((comments) => {
            // Send comments to user
            res.send(comments);
        })
        .catch((err) => {
            console.log(err);
        });
});


// Post Route for creating new comment to Event(not to another comment)
route.post('/:id/comments', (req, res) => {
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


// POST Route for Attending/Not Attending Events
route.post('/:id/attending', checkAPILoggedIn, (req, res) => {
    let attending = JSON.parse(req.body.attending);
    let promises = [];
    
    const addParticipant = models.Event.findById(req.params.id)
        .then((event) => {
            if (!req.user)
                return new Error('No User Found!');

            if (attending) {
                let index = event.peopleAttending.indexOf(req.user._id);
                if (index === -1) {
                    event.peopleAttending.push(req.user._id);
                }
            }
            else {
                let index = event.peopleAttending.indexOf(req.user._id);
                
                if (index > -1) {
                    event.peopleAttending.splice(index, 1);
                }
            }
            return event.save();            
        });
    
    promises.push(addParticipant);

    const addEvent = models.User.findById(req.user._id)
        .then((user) => {
            if (attending) {
                let index = user.eventsAttending.indexOf(req.params.id);
                if (index === -1) {
                    user.eventsAttending.push(req.params.id);
                }
            }
            else {
                let index = user.eventsAttending.indexOf(req.params.id);
                if (index > -1) {
                    user.eventsAttending.splice(index, 1);
                }
            }
            return user.save();
        });

    promises.push(addEvent);

    Promise.all(promises)
        .then(() => {
            res.send({ err: false });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ err: true });
        })
});


// Export the Router
module.exports = route;