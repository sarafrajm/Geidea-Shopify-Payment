const dotenv = require("dotenv");
dotenv.config();
// const connectDB = require("./connectDB/connect");

const express = require("express");
const cors = require("cors");
const app = express();
const authRouter = require("./routers/auth/auth");
const sessionRouter = require("./routers/session/session");

// connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", authRouter);
app.use("/api", sessionRouter);

app.get("/", async (req, res) => {
    return res.status(200).json({
        email: "sarafraj01999@gmail.com",
        status: "Success!",
        message: "Server is Running",
    });
})

app.listen(process.env.PORT || 8000, (err) => {
    console.log("Server is running");
});