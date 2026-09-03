const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        role: {
            type: String,
            required: true,
            enum: ["employee", "hr"],
            default: "employee"
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        leaveBalance: {
            type: Number,
            default: 20,
            min: 0
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "User",
    userSchema
);