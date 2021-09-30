const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    hashtags: {
        type: String,
        required: true,
        trim: true
    },
    img: {
        type: String,
        required: true,
        default: ""
    },
    cloudinary_id: {
        type: String,
        required: true,
        default: ""
    },
    admiresBy: [{
        type: String,
    }],
    admiresCount: {
        type: Number,
        default: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Users"         // This will create reference from this field to another model. In this case, it will convert ID of the owner to entire profile of that owner. For this we will use this code = await task.populate("owner").execPopulate(); (remember that this process which is being done in this code is asynchronus) (Whatever the model name we set for user in export user model we must use that exact name here.)
    }

}, { timestamps: true });


postSchema.methods.toJSON = function () {
    const post = this;
    const postObject = post.toObject();

    delete postObject.cloudinary_id;
    delete postObject.updatedAt;
    delete postObject.__v;

    return postObject;
}

const postModel = mongoose.model("Posts", postSchema);
module.exports = postModel;