const Passport = require("passport");
// Create Router
const route = require('express').Router();

// Require Models
const models = require("../models");

// GET ROUTE For Login/Signup Page
route.get('/loginsignup', (req,res)=>{
    res.render('loginsignup');
});

// POST Request for Logging In
route.post('/login', Passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/loginsignup'
}));

// Get Route for Logout
route.get('/logout', (req, res)=>{
    req.logout();
    res.redirect('/');
});

// POST Request for Sign Up
route.post('/signup', (req, res, next) => {
    // Check if user already exists
    models.User.findOne({
        username: req.body.username
    })
    .then((user)=>{
        if(user!==null)
            throw Error('User already exists!!');
        // If User not found, create User
        return models.User.create(req.body);
    })
    .then((user)=>{
        // If User created successfully
        // Log the user in
        Passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/loginsignup"
        })(req, res, next);
    })
    .catch((err)=>{
        console.log(`Error: ${err}`);
        res.redirect('/loginsignup.html');
    });
});


// Export the Router
module.exports = route;