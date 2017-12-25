// Create Router
const route = require('express').Router();

// Require Models
const models = require("../models");


// GET Route for New Event Page
route.get('/new', (req, res) => {
    res.render('newevent');
});

// POST Route for New Event
route.post("/", (req, res) => {
    // Create a new Event
    models.Event.create({
        ...req.body,
        organizers: [req.user._id]
    })
        .then((event) => {
            // Redirect to the new Event Page
            res.redirect(`/events/${event._id}`);
        })
        .catch((err) => {
            // Else log the error and redirect to same page
            console.log(`Error: ${err}`);
            res.redirect(req.baseUrl);
        });
});


// GET Route for a single Event Page
route.get('/:id', (req, res) => {
    // Find the Event
    models.Event.findById(req.params.id)
    .then((event) => {
        if (event === null)
            throw Error('Event does not exists!!');
        // If event found, Render the Event Page with event's details
        res.render('event', {event});
    })
    .catch((err) => {
            // If event not found or other Errors,
            // log the error and Redirect to Home Page
            console.log(`Error: ${err}`);
            res.redirect('/');
        });
});

// Get Route for all Comments of an event
route.get('/:id/comments', (req, res) => {
    // Find comments with the event id in params
    models.Comment.find({event: req.params.id})
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

// Export the Router
module.exports = route;