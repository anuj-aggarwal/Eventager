// Require passport and Strategy required
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// Require User files: Models
const models = require("./models");


// Serialize User: using username
passport.serializeUser((user, done) => {
    done(null, user.username);
});

// Deserialize User: using username
passport.deserializeUser((username, done) => {
    models.User.findOne({
        username
    })
    .then((user) => {
        done(null, user);
    })
    .catch((err) => {
        done(err);
    });
});


// Create a local Strategy to Authorize Users locally
const localStrategy = new LocalStrategy((username, password, done) => {
    // Find if the User exists
    models.User.findOne({
        username
    })
    .then((user)=>{
        // If user is not present: Error
        if(!user)
            return done(null, false, {message: "User does not exists!"});
        // If password is incorrect: Error
        if(user.password !== password)
            return done(null, false, {message: "Password Incorrect!!"});
        // User found!
        return done(null, user);
    })
    .catch((err)=>{
        done(err);
    });
});


// Use the local Strategy at 'local'
passport.use('local', localStrategy);

// Export Passport
module.exports = passport;