const express = require("express");
const postController = require("../controllers/post.controller");

// Middlewares
const userAuth = require("../middlewares/userAuth");
const multerUpload = require("../utils/multer");

const router = new express.Router();

router.get("/", postController.getAllPostsOfAllUsers);
router.get("/:id", postController.getSpecificPost);
router.get("/user/:id", postController.getAllPostsOfSpecificUser);

router.post("/", userAuth, multerUpload.single('img'), postController.createPost);
router.patch("/:id", userAuth, multerUpload.single('img'), postController.updatePost);
router.delete("/:id", userAuth, postController.deletePost);

router.post("/:id/admire", userAuth, postController.admirePost)
router.post("/:id/unadmire", userAuth, postController.unAdmirePost)

module.exports = router; 