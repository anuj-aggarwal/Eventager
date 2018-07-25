module.exports = {
    // Function to validate if user is logged in
    checkLoggedIn: (req, res, next) => {
        if (req.isAuthenticated())
            next();
        else {
            console.log("You must be Logged In!");
            res.redirect("/");
        }
    },

    // Function to validate if API user is logged in
    checkAPILoggedIn: (req, res, next) => {
        if (req.isAuthenticated())
            next();
        else {
            console.log("You must be Logged In!");
            res.sendStatus(401);
        }
    }
};