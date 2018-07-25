const fs = require("fs");
// Create Router
const route = require('express').Router();

// Require Models
const models = require("../models");

const { checkLoggedIn } = require("../utils/auth");
const { upload, cloudinary } = require("../utils/images");

// GET Route for all Events Page
route.get('/', (req, res) => {
    res.render('events');
});


// GET Route for New Event Page
route.get('/new', checkLoggedIn, (req, res) => {
    res.render('newevent');
});


// Upload Image to Cloudinary and Create Event
const uploadImageandCreateEvent = req => {
    if (req.file) {
        return cloudinary.uploader.upload(req.file.path)
            .then(result => {
                // Remove Image from File System
                fs.unlink(req.file.path);
                return models.Event.create({
                    ...req.body,
                    organizers: [req.user._id],
                    imageUrl: result.url
                });
            });
    }

    return models.Event.create({
        ...req.body,
        tags: req.body.tags.split(";").map(tag => tag.trim()).filter(tag => tag !== ""),
        organizers: [req.user._id]
    });
};

// POST Route for New Event
route.post("/", checkLoggedIn, upload.single('image'), (req, res) => {
    uploadImageandCreateEvent(req)
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

route.post('/filter', (req,res) => {
    res.redirect('/events?q='+req.body.old+req.body.filter);
})

// GET Route for a single Event Page
route.get('/:id', (req, res) => {
    // Find the Event
    models.Event.findById(req.params.id)
        .populate("organizers")
        .then((event) => {
            if (event === null)
                throw Error('Event does not exists!!');
            // If event found, Render the Event Page with event's details
            res.render('event', { event });
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