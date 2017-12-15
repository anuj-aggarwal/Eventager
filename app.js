// REQUIRE NODE MODULES
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");


// REQUIRE USER CREATED FILES
const config = require("./config");
const models = require("./models");
const Passport = require("./passport");


// INITIALIZATION
// Express App
const app = express();


// Set View Engine to ejs
app.set("view engine", "ejs");

// MIDDLEWARES
// Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Cookie Parser
app.use(cookieParser(config.COOKIE_SECRET_KEY));
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport
app.use(Passport.initialize());
app.use(Passport.session());


// FUNCTIONS: HELPERS
function checkLoggedIn(req, res, next) {
    if (req.user)
        next();
    else {
        console.log("Invalid Login");
        res.redirect("/");
    }
}


// ROUTES
// Serve static files at root
app.use('/', express.static(path.join(__dirname, 'public_static')));

// GET Request for Index Page
app.get('/', (req,res)=>{
    res.render('index');
});

// GET ROUTE For Login/Signup Page
app.get('/loginsignup', (req,res)=>{
    res.render('loginsignup');
});

// POST Request for Logging In
app.post('/login', Passport.authenticate('local', {
    successRedirect: '/success',
    failureRedirect: '/failure'
}));

// POST Request for Sign Up
app.post('/signup', (req, res, next) => {
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
            successRedirect: "/success",
            failureRedirect: "/failure"
        })(req, res, next);
    })
    .catch((err)=>{
        console.log(`Error: ${err}`);
        res.redirect('/loginsignup.html');
    });
});


// LISTEN AT PORT SPECIFIED
app.listen(config.SERVER.PORT, () => {
    console.log(`Server Started at http://localhost:${config.SERVER.PORT}/`);
});