// Function to validate if user is logged in
function checkLoggedIn(req, res, next) {
    if (req.user)
        next();
    else {
        console.log("Invalid Login");
        res.redirect("/");
    }
}