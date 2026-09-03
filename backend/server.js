require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const attendanceRoutes = require("./routes/attendance");
const leaveRoutes = require("./routes/leave");

const app = express();

app.use(cors());
app.use(express.json());


// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB connected successfully");

    })
    .catch((error) => {

        console.log("MongoDB connection failed:", error);

    });


// Normal test route
app.get("/", (req, res) => {

    res.send("Employee Attendance Backend is running");

});


// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {

    res.json({
        message: "You are authenticated!",
        user: req.user
    });

});


// Start server
app.listen(5000, () => {

    console.log("Server running on port 5000");

});