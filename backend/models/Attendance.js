const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true
        },

        date: {
            type: String,
            required: true
        },

        checkIn: {
            type: String,
            required: true
        },

        checkOut: {
            type: String,
            default: null
        },

        workingHours: {
            type: Number,
            default: null,
            min: 0
        },

        status: {
            type: String,
            required: true,
            enum: [
                "Present",
                "Late",
                "Half Day"
            ]
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Attendance",
    attendanceSchema
);