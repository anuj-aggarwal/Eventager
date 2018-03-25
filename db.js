// Require mongoose
const mongoose = require("mongoose");

// DB Config File
const CONFIG = require("./config");

// Connect to MongoDB Database
mongoose
	.connect(`mongodb://${CONFIG.DB.HOST}:${CONFIG.DB.PORT}/${CONFIG.DB.NAME}`)
	.then(() => {
		console.log("Database Ready for use!");
	})
	.catch(err => {
		console.log(`Error starting Database: ${err}`);
    });

// Export db connection
module.exports = mongoose;