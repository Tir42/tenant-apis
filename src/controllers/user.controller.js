const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, fullPhoneNumber, password, idCode, id_code } = req.body;
        const finalIdCode = idCode || id_code;

        if (!firstName || !lastName || !email || !fullPhoneNumber || !password || !finalIdCode) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (including idCode/id_code)",
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
            idCode: finalIdCode,
        });

        console.log("Saved user data:", {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            fullPhoneNumber: user.fullPhoneNumber,
            idCode: user.idCode,
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
                id_code: user.idCode,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// LOGIN USER
const loginUser = async (req, res) => {
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

        const token = jwt.sign(
            { userId: user.userId, email: user.email },
            process.env.JWT_SECRET || "default_jwt_secret_fallback",
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            idCode: user.idCode,
            id_code: user.idCode,
            data: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                fullPhoneNumber: user.fullPhoneNumber,
                idCode: user.idCode,
                id_code: user.idCode,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
