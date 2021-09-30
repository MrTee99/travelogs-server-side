const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PostModel = require("../models/post.model")

const userSchema = new mongoose.Schema({
    
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw ("Invalid Email");
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if(value.length < 6) {
                throw ("Password length must be greater than 6 characters");
            }   
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    img: {
        type: String,
        default: ""
    },
    cloudinary_id: {
        type: String,
        default: ""
    },
    totalPosts: {
        type: Number,
        default: 0
    },
    totalFollowers: {
        type: Number,
        default: 0
    },
    totalAdmirers: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

userSchema.pre("save", async function(next) {
    const user = this;
    if(user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
});

userSchema.pre("remove", async function(next) {
    const user = this;
    await PostModel.deleteMany({ owner: user._id });
    next();
});

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_SIGNATURE)

    user.tokens = user.tokens.concat({ token: token })
    await user.save();

    return token;
}

userSchema.statics.findUserByCredentials = async function(email, password) {
    const user = await UserModel.findOne({ email  })
    if(!user) throw ("Inavlid email or password");

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) throw ("Inavlid email or password");

    return user;
}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.email;
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.cloudinary_id;
    delete userObject.updatedAt;
    delete userObject.__v;

    return userObject;
}

const UserModel = mongoose.model("Users", userSchema);
module.exports = UserModel;