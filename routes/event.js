// Create Router
const route = require('express').Router();

// Require Models
const models = require("../models");

const { checkLoggedIn } = require("../utils/auth");

// GET Route for all Events Page
route.get('/', (req,res)=>{
    res.render('events');
});


// GET Route for New Event Page
route.get('/new', checkLoggedIn, (req, res) => {
    res.render('newevent');
});

// POST Route for New Event
route.post("/", checkLoggedIn, (req, res) => {
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



// Export the Router
module.exports = route;