const userModel = require("../models/user.model");
const cloudinary = require("../utils/cloudinary");
const cloudinaryAdminAPI = require("cloudinary").v2


const getOtherUserProfileInfo = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).populate({ path: "posts" }).exec();
        if(!user) res.status(404).send({ error: "User not found"});
        res.status(200).send(user);
    }
    catch (err) {
        res.status(500).send(err)
    }
}


const loginUser = async (req, res) => {
    try {
        const user = await userModel.findUserByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token })
    }
    catch (err) {
        res.status(400).send(err)
    }
}
const registerUser = async (req, res) => {
    const newUser = new userModel(req.body)

    try {
        await newUser.save();
        const token = await newUser.generateAuthToken();
        res.status(201).send({ user: newUser, token });
    }
    catch (err) {
        res.status(400).send(err)
    }
}


const logoutUser = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((tokenObject) => tokenObject.token !== req.token);
        await req.user.save();
        res.status(200).send();
    }
    catch (err) {
        res.status(500).send(err)
    }
}
const logoutUserFromAllSessions = async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    }
    catch (err) {
        res.status(500).send(err)
    }
}


const getProfileInfo = async (req, res) => {
    try {
        res.status(200).send(req.user)
    }
    catch (err) {
        res.status(500).send(err)
    }
}
const updateProfileInfo = async (req, res) => {
    const userData = JSON.parse(req.body.data);
    const propsToUpdate = Object.keys(userData);
    const propsAllowedToUpdate = ["username", "password"]
    const isValidUpdate = propsToUpdate.every((prop) => propsAllowedToUpdate.includes(prop))
    
    if (!isValidUpdate) return res.status(400).send({error: "Inavlid property selected to update"})

    try {
        if(!!req.file) {
            const cloudinaryOptions = (!req.user.cloudinary_id) ? { folder: `travelogs/${req.user._id}`  } : { public_id: req.user.cloudinary_id, overwrite: true }
            const result = await cloudinary.uploader.upload(req.file.path, cloudinaryOptions)
            req.user["img"] = result.secure_url;
            if(!req.user.cloudinary_id) req.user["cloudinary_id"] = result.public_id
        }

        propsToUpdate.forEach((prop) => req.user[prop] = userData[prop])
        await req.user.save();
        res.status(200).send(req.user);
    }
    catch(err) {
        res.status(500).send(err)
    }
}
const deleteProfile = async (req, res) => {
    try { 
        await req.user.remove();
        if(req.user.cloudinary_id) await cloudinary.uploader.destroy(req.user.cloudinary_id);
        await cloudinaryAdminAPI.api.delete_resources_by_prefix(`travelogs/${req.user._id}/posts`);
        if(req.user.cloudinary_id) await cloudinaryAdminAPI.api.delete_folder(`travelogs/${req.user._id}`)
        res.status(200).send(req.user);
    }
    catch (err) {
        res.status(500).send(err);
    }
}


module.exports = {
    getOtherUserProfileInfo,
    
    loginUser,
    registerUser,

    logoutUser,
    logoutUserFromAllSessions,

    getProfileInfo,
    updateProfileInfo,
    deleteProfile,
}
