const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


/* =========================
   REGISTER
========================= */

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            employeeId,
            department
        } = req.body;


        /* =========================
           BASIC VALIDATION
        ========================= */

        if (
            !name ||
            !email ||
            !password ||
            !employeeId ||
            !department
        ) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        /* =========================
           CHECK EXISTING EMAIL
        ========================= */

        const existingUser = await User.findOne({
            email: email
        });

        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            });

        }


        /* =========================
           CHECK EXISTING EMPLOYEE ID
        ========================= */

        const existingEmployee = await User.findOne({
            employeeId: employeeId
        });

        if (existingEmployee) {

            return res.status(400).json({
                message: "Employee ID already exists"
            });

        }


        /* =========================
           HASH PASSWORD
        ========================= */

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        /* =========================
           CREATE EMPLOYEE
           
           IMPORTANT:
           Role is NOT taken from
           req.body anymore.
        ========================= */

        const user = new User({

            name: name,

            email: email,

            password: hashedPassword,

            employeeId: employeeId,

            role: "employee",

            department: department

        });


        await user.save();


        res.status(201).json({

            message:
                "User registered successfully"

        });

    } catch (error) {

        console.log(
            "Registration error:",
            error
        );

        res.status(500).json({

            message:
                "Registration failed"

        });

    }

});


/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        /* =========================
           VALIDATION
        ========================= */

        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password are required"

            });

        }


        /* =========================
           FIND USER
        ========================= */

        const user = await User.findOne({
            email: email
        });


        if (!user) {

            return res.status(400).json({

                message:
                    "Invalid email or password"

            });

        }


        /* =========================
           CHECK PASSWORD
        ========================= */

        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordCorrect) {

            return res.status(400).json({

                message:
                    "Invalid email or password"

            });

        }


        /* =========================
           CREATE JWT
        ========================= */

        const token = jwt.sign(

            {
                id: user._id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );


        /* =========================
           RESPONSE
        ========================= */

        res.json({

            message:
                "Login successful",

            token: token,

            user: {

                name: user.name,

                email: user.email,

                employeeId: user.employeeId,

                role: user.role,

                department: user.department

            }

        });

    } catch (error) {

        console.log(
            "Login error:",
            error
        );

        res.status(500).json({

            message:
                "Login failed"

        });

    }

});


module.exports = router;