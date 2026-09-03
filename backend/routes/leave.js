const express = require("express");

const Leave = require("../models/Leave");
const User = require("../models/User");

const authMiddleware = require("../middleware/auth");
const hrMiddleware = require("../middleware/hr");

const router = express.Router();


/* =========================
   HELPER
   CALCULATE LEAVE DAYS
========================= */

const calculateLeaveDays = (startDate, endDate) => {

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    const difference =
        end - start;

    return (
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        ) + 1
    );

};


/* =========================
   APPLY FOR LEAVE
========================= */

router.post(
    "/apply",
    authMiddleware,
    async (req, res) => {

        try {

            const employeeId =
                req.user.id;

            const {
                startDate,
                endDate,
                reason
            } = req.body;


            /* =========================
               REQUIRED FIELDS
            ========================= */

            if (
                !startDate ||
                !endDate ||
                !reason
            ) {

                return res.status(400).json({

                    message:
                        "All leave fields are required"

                });

            }


            /* =========================
               DATE VALIDATION
            ========================= */

            if (endDate < startDate) {

                return res.status(400).json({

                    message:
                        "End date cannot be before start date"

                });

            }


            /* =========================
               GET TODAY'S DATE
            ========================= */

            const today =
                new Date()
                    .toLocaleDateString(
                        "en-CA",
                        {
                            timeZone:
                                "Asia/Kolkata"
                        }
                    );


            /* =========================
               PREVENT PAST LEAVE
            ========================= */

            if (startDate < today) {

                return res.status(400).json({

                    message:
                        "Leave cannot be applied for a past date"

                });

            }


            /* =========================
               CALCULATE DAYS
            ========================= */

            const leaveDays =
                calculateLeaveDays(
                    startDate,
                    endDate
                );


            if (leaveDays <= 0) {

                return res.status(400).json({

                    message:
                        "Invalid leave duration"

                });

            }


            /* =========================
               GET EMPLOYEE
            ========================= */

            const employee =
                await User.findById(
                    employeeId
                );


            if (!employee) {

                return res.status(404).json({

                    message:
                        "Employee not found"

                });

            }


            /* =========================
               CHECK LEAVE BALANCE
            ========================= */

            if (
                employee.leaveBalance <
                leaveDays
            ) {

                return res.status(400).json({

                    message:
                        `You only have ${employee.leaveBalance} leave days available`

                });

            }


            /* =========================
               CHECK OVERLAPPING LEAVE
            ========================= */

            const overlappingLeave =
                await Leave.findOne({

                    employeeId:
                        employeeId,

                    status: {
                        $in: [
                            "Pending",
                            "Approved"
                        ]
                    },

                    startDate: {
                        $lte: endDate
                    },

                    endDate: {
                        $gte: startDate
                    }

                });


            if (overlappingLeave) {

                return res.status(400).json({

                    message:
                        "You already have a pending or approved leave during these dates"

                });

            }


            /* =========================
               CREATE LEAVE
            ========================= */

            const leave =
                new Leave({

                    employeeId:
                        employeeId,

                    startDate:
                        startDate,

                    endDate:
                        endDate,

                    reason:
                        reason,

                    status:
                        "Pending"

                });


            await leave.save();


            res.status(201).json({

                message:
                    "Leave application submitted",

                leave:
                    leave

            });

        } catch (error) {

            console.log(
                "Apply leave error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to apply for leave"

            });

        }

    }
);


/* =========================
   MY LEAVE HISTORY
========================= */

router.get(
    "/my",
    authMiddleware,
    async (req, res) => {

        try {

            const employeeId =
                req.user.id;


            const leaves =
                await Leave.find({

                    employeeId:
                        employeeId

                }).sort({

                    startDate: 1

                });


            res.json({

                leaves:
                    leaves

            });

        } catch (error) {

            console.log(
                "Fetch leaves error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to fetch leave applications"

            });

        }

    }
);


/* =========================
   LEAVE BALANCE
========================= */

router.get(
    "/balance",
    authMiddleware,
    async (req, res) => {

        try {

            const employeeId =
                req.user.id;


            const employee =
                await User.findById(
                    employeeId
                );


            if (!employee) {

                return res.status(404).json({

                    message:
                        "Employee not found"

                });

            }


            res.json({

                leaveBalance:
                    employee.leaveBalance

            });

        } catch (error) {

            console.log(
                "Leave balance error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to fetch leave balance"

            });

        }

    }
);


/* =========================
   HR - ALL LEAVES
========================= */

router.get(
    "/all",
    authMiddleware,
    hrMiddleware,
    async (req, res) => {

        try {

            const leaves =
                await Leave.find()
                    .sort({
                        startDate: 1
                    });


            const result =
                await Promise.all(

                    leaves.map(
                        async (leave) => {

                            const employee =
                                await User.findById(
                                    leave.employeeId
                                );


                            return {

                                _id:
                                    leave._id,

                                employeeId:
                                    employee
                                        ? employee.employeeId
                                        : leave.employeeId,

                                employeeName:
                                    employee
                                        ? employee.name
                                        : "Unknown",

                                department:
                                    employee
                                        ? employee.department
                                        : "Unknown",

                                startDate:
                                    leave.startDate,

                                endDate:
                                    leave.endDate,

                                reason:
                                    leave.reason,

                                status:
                                    leave.status

                            };

                        }
                    )

                );


            res.json({

                leaves:
                    result

            });

        } catch (error) {

            console.log(
                "Fetch all leaves error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to fetch leave applications"

            });

        }

    }
);


/* =========================
   HR - APPROVE / REJECT
========================= */

router.put(
    "/:id/status",
    authMiddleware,
    hrMiddleware,
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            /* =========================
               VALID STATUS
            ========================= */

            if (
                status !== "Approved" &&
                status !== "Rejected"
            ) {

                return res.status(400).json({

                    message:
                        "Status must be Approved or Rejected"

                });

            }


            /* =========================
               FIND LEAVE
            ========================= */

            const leave =
                await Leave.findById(
                    req.params.id
                );


            if (!leave) {

                return res.status(404).json({

                    message:
                        "Leave application not found"

                });

            }


            /* =========================
               PREVENT CHANGING
               COMPLETED REQUEST
            ========================= */

            if (
                leave.status !== "Pending"
            ) {

                return res.status(400).json({

                    message:
                        "This leave request has already been processed"

                });

            }


            /* =========================
               REJECT
            ========================= */

            if (
                status === "Rejected"
            ) {

                leave.status =
                    "Rejected";

                await leave.save();


                return res.json({

                    message:
                        "Leave rejected successfully",

                    leave:
                        leave

                });

            }


            /* =========================
               APPROVE
            ========================= */

            const employee =
                await User.findById(
                    leave.employeeId
                );


            if (!employee) {

                return res.status(404).json({

                    message:
                        "Employee not found"

                });

            }


            /* =========================
               CALCULATE LEAVE DAYS
            ========================= */

            const leaveDays =
                calculateLeaveDays(
                    leave.startDate,
                    leave.endDate
                );


            /* =========================
               CHECK CURRENT BALANCE
            ========================= */

            if (
                employee.leaveBalance <
                leaveDays
            ) {

                return res.status(400).json({

                    message:
                        "Employee has insufficient leave balance"

                });

            }


            /* =========================
               DEDUCT LEAVE
            ========================= */

            employee.leaveBalance =
                employee.leaveBalance -
                leaveDays;


            await employee.save();


            /* =========================
               UPDATE STATUS
            ========================= */

            leave.status =
                "Approved";


            await leave.save();


            res.json({

                message:
                    "Leave approved successfully",

                leave:
                    leave

            });

        } catch (error) {

            console.log(
                "Leave status error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to update leave status"

            });

        }

    }
);


module.exports = router;