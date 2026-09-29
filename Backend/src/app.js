const express = require('express');
const authRouter = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes');
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express();

// Middleware to parse incoming JSON bodies
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))

// Using all the routes here
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

// Central error handler (multer errors, Gemini/Mongo failures, etc.) -> JSON instead of HTML stack traces
app.use((err, req, res, next) => {
    console.error(err)
    const status = err.name === "MulterError" || err.message?.startsWith("Only PDF") ? 400 : (err.status || 500)
    res.status(status).json({ message: err.message || "Something went wrong" })
})

module.exports = app;
