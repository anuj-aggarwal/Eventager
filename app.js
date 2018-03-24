// REQUIRE NODE MODULES
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


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


// Use user for all renders
app.use((req, res, next)=>{
    res.locals.user= req.user;
    next();
});

// ROUTES
// Routers
app.use("/events", require('./routes/event'));
app.use("/comments", require('./routes/comment'));


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
    successRedirect: '/',
    failureRedirect: '/loginsignup'
}));

// Get Route for Logout
app.get('/logout', (req, res)=>{
    req.logout();
    res.redirect('/');
});

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
            successRedirect: "/",
            failureRedirect: "/loginsignup"
        })(req, res, next);
    })
    .catch((err)=>{
        console.log(`Error: ${err}`);
        res.redirect('/loginsignup.html');
    });
});

// GET Route for Forgot Password Page
app.get('/forgot', (req, res)=>{
    res.render('forgot');
});

// POST Route for Forgot Password
app.post('/forgot', (req, res)=>{
    crypto.randomBytes(20, (err, buff)=>{
        if(err) {
            console.log(err);
            return new Error('Problem in generating Random String');
        }
        let token = buff.toString('hex');
        models.User.findOne({email: req.body.email})
            .then((user)=>{
                if(!user) return new Error('Email doesn\'t Exist');
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;

                return user.save();
            })
            .then((user)=>{
                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: config.MAILER.EMAIL,
                        pass: config.MAILER.PASSWORD
                    }
                });
                const mailOptions = {
                    to: user.email,
                    from: config.MAILER.EMAIL,
                    subject: 'Eventager Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                transporter.sendMail(mailOptions)
                    .then(()=>{
                        console.log('Mail Sent!');
                    })
                    .catch((err)=>{
                        console.log(err);
                    });
                res.redirect('/');
            })
            .catch((err)=>{
                console.log(err);
                res.redirect('/forgot');
            })
    })
});

app.get('/reset/:token', (req, res)=>{
    models.User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user)=>{
            if(!user) {
                return new Error('Token Invalid or Time expired');
            }
            res.render('reset', {
                user: user
            });
        })
        .catch((err)=>{
            console.log(err);
            res.redirect('/forgot');
        })
});

app.post('/reset/:token', (req, res)=>{
    models.User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user)=>{
            if(!user) {
                return new Error('Password Token invalid or expired');
            }
            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save()
                .then((user)=>{
                    Passport.authenticate('local', {
                        successRedirect: '/',
                        failureRedirect: '/forgot'
                    });
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: config.MAILER.EMAIL,
                            pass: config.MAILER.PASSWORD
                        }
                    });
                    const mailOptions = {
                        to: user.email,
                        from: config.MAILER.EMAIL,
                        subject: 'Your password for Eventager Account has been changed',
                        text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                    };
                    transporter.sendMail(mailOptions)
                        .then(()=>{
                            console.log('Mail Sent!');
                        })
                        .catch((err)=>{
                            return new Error('Error sending Mail');
                        });
                    res.redirect('/loginsignup');
                })
        })
        .catch((err)=>{
            console.log(err);
            res.redirect('/forgot');
        });
});


// LISTEN AT PORT SPECIFIED
app.listen(config.SERVER.PORT, () => {
    console.log(`Server Started at http://localhost:${config.SERVER.PORT}/`);
});