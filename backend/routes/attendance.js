const express = require("express");

const Attendance = require("../models/Attendance");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const hrMiddleware = require("../middleware/hr");
const Leave = require("../models/Leave");

const router = express.Router();


/* =========================
   GET CURRENT IST DATE/TIME
========================= */

const getISTDateTime = () => {

    const formatter = new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    );

    const parts = formatter.formatToParts(new Date());

    const values = {};

    parts.forEach(part => {
        values[part.type] = part.value;
    });

    return {

        date:
            `${values.year}-${values.month}-${values.day}`,

        time:
            `${values.hour}:${values.minute}`,

        hour:
            Number(values.hour),

        minute:
            Number(values.minute)

    };

};


/* =========================
   CHECK IN
========================= */

router.post("/checkin", authMiddleware, async (req, res) => {

    try {

        const employeeId = req.user.id;

        const {
            date,
            time,
            hour,
            minute
        } = getISTDateTime();


        /* =========================
           CHECK EXISTING ATTENDANCE
        ========================= */

        const existingAttendance =
            await Attendance.findOne({

                employeeId: employeeId,

                date: date

            });


        if (existingAttendance) {

            return res.status(400).json({

                message:
                    "Already checked in today"

            });

        }


        /* =========================
           DETERMINE STATUS
           
           Up to 9:15 AM = Present
           After 9:15 AM = Late
        ========================= */

        let status;


        if (
            hour < 9 ||
            (
                hour === 9 &&
                minute <= 15
            )
        ) {

            status = "Present";

        } else {

            status = "Late";

        }


        /* =========================
           CREATE ATTENDANCE
        ========================= */

        const attendance =
            new Attendance({

                employeeId: employeeId,

                date: date,

                checkIn: time,

                status: status

            });


        await attendance.save();


        res.status(201).json({

            message:
                "Check-in successful",

            attendance:
                attendance

        });

    } catch (error) {

        console.log(
            "Check-in error:",
            error
        );

        res.status(500).json({

            message:
                "Check-in failed"

        });

    }

});


/* =========================
   CHECK OUT
========================= */

router.post("/checkout", authMiddleware, async (req, res) => {

    try {

        const employeeId = req.user.id;

        const {
            date,
            time,
            hour,
            minute
        } = getISTDateTime();


        /* =========================
           FIND TODAY'S ATTENDANCE
        ========================= */

        const attendance =
            await Attendance.findOne({

                employeeId: employeeId,

                date: date

            });


        if (!attendance) {

            return res.status(400).json({

                message:
                    "Please check in first"

            });

        }


        /* =========================
           CHECK IF ALREADY CHECKED OUT
        ========================= */

        if (attendance.checkOut) {

            return res.status(400).json({

                message:
                    "Already checked out today"

            });

        }


        /* =========================
           CHECK-IN TIME
        ========================= */

        const [
            checkInHour,
            checkInMinute
        ] = attendance.checkIn
            .split(":")
            .map(Number);


        /* =========================
           CONVERT TIMES TO MINUTES
        ========================= */

        const checkInTotalMinutes =
            checkInHour * 60 +
            checkInMinute;


        const checkOutTotalMinutes =
            hour * 60 +
            minute;


        /* =========================
           CALCULATE WORKING MINUTES
        ========================= */

        let workingMinutes =
            checkOutTotalMinutes -
            checkInTotalMinutes;


        /*
         * This handles a midnight
         * crossing just in case.
         */

        if (workingMinutes < 0) {

            workingMinutes +=
                24 * 60;

        }


        /* =========================
           CALCULATE WORKING HOURS
        ========================= */

        const workingHours =
            workingMinutes / 60;


        /* =========================
           UPDATE ATTENDANCE
        ========================= */

        attendance.checkOut =
            time;

        attendance.workingHours =
            Number(
                workingHours.toFixed(2)
            );


        /* =========================
           HALF DAY
           
           Less than 4 hours
        ========================= */

        if (workingHours < 4) {

            attendance.status =
                "Half Day";

        }


        await attendance.save();


        res.json({

            message:
                "Check-out successful",

            attendance:
                attendance

        });

    } catch (error) {

        console.log(
            "Check-out error:",
            error
        );

        res.status(500).json({

            message:
                "Check-out failed"

        });

    }

});


/* =========================
   GET MY ATTENDANCE
========================= */

router.get("/my", authMiddleware, async (req, res) => {

    try {

        const employeeId =
            req.user.id;


        const attendance =
            await Attendance.find({

                employeeId:
                    employeeId

            }).sort({

                date: -1

            });


        res.json({

            attendance:
                attendance

        });

    } catch (error) {

        console.log(
            "Fetch attendance error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch attendance"

        });

    }

});


/* =========================
   HR ATTENDANCE
========================= */

router.get(
    "/all",
    authMiddleware,
    hrMiddleware,
    async (req, res) => {

        try {

            const {
                date
            } = getISTDateTime();


            /* =========================
               GET ALL EMPLOYEES
            ========================= */

            const employees =
                await User.find({

                    role: "employee"

                });


            /* =========================
               GET TODAY'S ATTENDANCE
            ========================= */

            const attendance =
                await Attendance.find({

                    date: date

                });


            /* =========================
               GET TODAY'S APPROVED LEAVE
            ========================= */

            const leaves =
                await Leave.find({

                    startDate: {
                        $lte: date
                    },

                    endDate: {
                        $gte: date
                    },

                    status: "Approved"

                });


            /* =========================
               BUILD HR RESULT
            ========================= */

            const result =
                employees.map(employee => {

                    const employeeAttendance =
                        attendance.find(

                            record =>
                                record.employeeId ===
                                employee._id.toString()

                        );


                    const employeeLeave =
                        leaves.find(

                            leave =>
                                leave.employeeId ===
                                employee._id.toString()

                        );


                    let status;


                    if (employeeLeave) {

                        status = "Leave";

                    }
                    else if (employeeAttendance) {

                        status =
                            employeeAttendance.status;

                    }
                    else {

                        status = "Absent";

                    }


                    return {

                        employeeId:
                            employee.employeeId,

                        name:
                            employee.name,

                        department:
                            employee.department,

                        status:
                            status,

                        checkIn:
                            employeeAttendance
                                ? employeeAttendance.checkIn
                                : null,

                        checkOut:
                            employeeAttendance
                                ? employeeAttendance.checkOut
                                : null,

                        workingHours:
                            employeeAttendance
                                ? employeeAttendance.workingHours
                                : null

                    };

                });


            res.json({

                date:
                    date,

                attendance:
                    result

            });

        } catch (error) {

            console.log(
                "HR attendance error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to fetch attendance summary",

                error:
                    error.message

            });

        }

    }
);


module.exports = router;