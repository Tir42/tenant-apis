const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("./user.model");

const router = express.Router();

// REGISTER USER
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, fullPhoneNumber, password } = req.body;

        if (!firstName || !lastName || !email || !fullPhoneNumber || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { fullPhoneNumber }],
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const lastUser = await User.findOne().sort({ userId: -1 });
        const newUserId = lastUser && lastUser.userId ? lastUser.userId + 1 : 1;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            userId: newUserId,
            firstName,
            lastName,
            email,
            fullPhoneNumber,
            password: hashedPassword,
        });

        console.log("Saved user data:", {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            fullPhoneNumber: user.fullPhoneNumber,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                fullPhoneNumber: user.fullPhoneNumber,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// LOGIN USER
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                fullPhoneNumber: user.fullPhoneNumber,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;