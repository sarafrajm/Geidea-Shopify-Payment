const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const {connectDB} = require("./db-operation/db");

const express = require("express");
const cors = require("cors");
const app = express();
const authRouter = require("./routers/auth/auth");
const sessionRouter = require("./routers/session/session");

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", authRouter);
app.use("/api", sessionRouter);

app.listen(process.env.PORT || 8000, (err) => {
    console.log("Server is running");
});