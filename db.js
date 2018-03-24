// Require mongoose
const mongoose = require("mongoose");

// DB Config File
const config = require("./config");

// Connect to MongoDB Database
mongoose
	.connect(`mongodb://${config.DB.HOST}:${config.DB.PORT}/${config.DB.NAME}`)
	.then(() => {
		console.log("Database Ready for use!");
	})
	.catch(err => {
		console.log(`Error starting Database: ${err}`);
    });

// Export db connection
module.exports = mongoose;