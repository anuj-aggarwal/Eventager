const multer = require("multer");
const cloudinary = require("cloudinary");
const { CLOUDINARY } = require("../config");

const upload = multer({
    dest: "./uploads",
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(null, false);
        }
        cb(null, true);
    }
});

cloudinary.config({
    cloud_name: CLOUDINARY.CLOUD_NAME,
    api_key: CLOUDINARY.API_KEY,
    api_secret: CLOUDINARY.API_SECRET
});

module.exports = { upload, cloudinary };