const PostModel = require("../models/post.model");
const cloudinary = require("../utils/cloudinary");

const getAllPostsOfAllUsers = async (req, res) => {
    const options = {
        limit: (req.query.limit) ? parseInt(req.query.limit) : 10,
        skip: (req.query.skip) ? parseInt(req.query.skip) : 0
    }

    try {
        const posts = await PostModel.find({}, null, options).populate({ path: "owner", select: "username img" }).exec();
        res.status(200).send(posts);
    }
    catch(error) {
        res.status(500).send(error);
    }
}
const getSpecificPost = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id).populate({ path: "owner", select: "username img" }).exec();
        if(!post) res.status(404).send({ error: "Post not found"});
        res.status(200).send(post);
    }
    catch (err) {
        res.status(500).send(err)
    }
}
const getAllPostsOfSpecificUser = async (req, res) => {
    const options = {
        limit: (req.query.limit) ? parseInt(req.query.limit) : 10,
        skip: (req.query.skip) ? parseInt(req.query.skip) : 0
    }

    try {
        const posts = await PostModel.find({ owner: req.params.id }, null, options).populate({ path: "owner", select: "username img" }).exec();
        res.status(200).send(posts);
    }
    catch(error) {
        res.status(500).send(error);
    }
}


const createPost = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: `travelogs/${req.user._id}/posts` });
        const newPost = new PostModel({
            ...JSON.parse(req.body.data),
            img: result.secure_url,
            cloudinary_id: result.public_id,
            owner: req.user._id
        })
        await newPost.save();
        res.status(201).send(newPost);
    }
    catch (error) {
        res.status(400).send(error);
    }
}
const updatePost = async (req, res) => {
    const postData = JSON.parse(req.body.data);
    const fieldsToUpdate = Object.keys(postData);
    const fieldsAllowedToUpdate = ["title", "description", "hashtags"];
    const isValidUpdate = fieldsToUpdate.every((field) => fieldsAllowedToUpdate.includes(field));

    if(!isValidUpdate) res.status(400).send({ error: "Invaild field provided to update" })

    try {
        const postToUpdate = await PostModel.findOne({ _id: req.params.id, owner: req.user._id });
        if(!postToUpdate) res.status(404).send({ error: "Post Not Found" })

        if(!!req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { public_id: postToUpdate.cloudinary_id, overwrite: true })
            postToUpdate["img"] = result.secure_url
        }

        fieldsToUpdate.forEach((field) => postToUpdate[field] = postData[field]);
        await postToUpdate.save();
        res.status(200).send(postToUpdate);
    }
    catch (error) {
        res.status(500).send(error);
    }
}
const deletePost = async (req, res) => {
    try {
        const postToDelete = await PostModel.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if(!postToDelete) return res.status(404).send({ error: "Post Not Found" });
        await cloudinary.uploader.destroy(postToDelete.cloudinary_id);
        res.status(200).send(postToDelete);
    }
    catch(error) {
        res.status(500).send(error);
    }
}


const admirePost = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if(!post) res.status(404).send({ error: "Post not found"});

        if(!post.admiresBy.includes(req.user._id.toString())) {
            post.admiresBy.push(req.user._id.toString());
            post.admiresCount = post.admiresBy.length;
            await post.save();
        }

        res.status(200).send(post);
    }
    catch(error) {
        res.status(500).send(error)
    }
}
const unAdmirePost = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if(!post) res.status(404).send({ error: "Post not found"});

        post.admiresBy = post.admiresBy.filter((id) => id !== req.user._id.toString());
        post.admiresCount = post.admiresBy.length;
        await post.save();

        res.status(200).send(post);
    }
    catch(error) {
        res.status(500).send(error)
    }
}

module.exports = {
    getAllPostsOfAllUsers,
    getSpecificPost,
    getAllPostsOfSpecificUser,

    createPost,
    updatePost,
    deletePost,

    admirePost,
    unAdmirePost
}