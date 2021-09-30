const multer = require("multer");

module.exports = multer({
    limits: { fileSize: 1000000 },          // 1MB
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        const regularExpression = /\.(png|jpg|jpeg)$/;
        if(!file.originalname.match(regularExpression)) {
            cb(new Error("Image format not supported. Supported formats are png, jpg and jpeg"), false);
        }
        else {
            cb(undefined, true);
        }   
    }
})