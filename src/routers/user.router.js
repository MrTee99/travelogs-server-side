const express = require("express");
const userController = require("../controllers/user.controller")

// Middlewares
const userAuth = require("../middlewares/userAuth");
const multerUpload = require("../utils/multer");

const router = new express.Router();

router.get("/:id", userController.getOtherUserProfileInfo)

router.post("/login", userController.loginUser)
router.post("/register", userController.registerUser)

router.post("/logout", userAuth, userController.logoutUser)
router.post("/logout/allSessions", userAuth, userController.logoutUserFromAllSessions)

router.get("/", userAuth, userController.getProfileInfo)
router.patch("/", userAuth, multerUpload.single('img'), userController.updateProfileInfo);
router.delete("/", userAuth, userController.deleteProfile);

module.exports = router