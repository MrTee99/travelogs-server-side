const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const postRouter = require("./routers/post.router");
const userRouter = require("./routers/user.router");

const app = express();
app.use(cors());

app.use(express.json());
// app.use(express.json({ limit: "30mb", extended: true}));
// app.use(express.urlencoded({ limit: "30mb", extended: true}));

app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);

mongoose.connect(process.env.MONGODB_URL)
.then(() => app.listen(process.env.PORT, () => console.log("Server running on port", process.env.PORT)))
.catch((err) => console.log("MongoDB Database connection Failed:", err.message));