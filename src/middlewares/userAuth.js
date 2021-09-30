// Express Middleware Explanation:
// Without Middleware:  new request -> run route handler
// With Middleware:     new request -> execute middleware code then decide to run route handler or not -> run route handler

const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const verifiedAndDecodedToken = jwt.verify(token, process.env.JWT_SECRET_SIGNATURE);

        const user = await userModel.findOne({ _id: verifiedAndDecodedToken._id, "tokens.token": token });
        if(!user) throw new Error();  

        req.user = user;
        req.token = token;

        next();
    }
    catch(error) {
        res.status(401).send({ error: "Authentication Failed" })
    }
}

module.exports = userAuth;