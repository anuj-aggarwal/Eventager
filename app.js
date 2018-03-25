// REQUIRE NODE MODULES
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);


// REQUIRE USER CREATED FILES
const CONFIG = require("./config");
const models = require("./models");
const Passport = require("./passport");

// Connect to DB
const db = require("./db");


// INITIALIZATION
// Express App
const app = express();


// Set View Engine to ejs
app.set("view engine", "ejs");

// MIDDLEWARES
// Parse Body
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Cookie Parser
app.use(cookieParser(CONFIG.COOKIE_SECRET_KEY));
app.use(session({
    secret: CONFIG.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: db.connection })
}));

// Initialize Passport
app.use(Passport.initialize());
app.use(Passport.session());


// Use user for all renders
app.use((req, res, next)=>{
    res.locals.user= req.user;
    next();
});



// ROUTES
// Routers
app.use("/", require("./routes"));


// LISTEN AT PORT SPECIFIED
app.listen(CONFIG.SERVER.PORT, () => {
    console.log(`Server Started at http://localhost:${CONFIG.SERVER.PORT}/`);
});