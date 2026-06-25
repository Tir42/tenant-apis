const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

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

// FORGOT PASSWORD (EMAIL OTP GENERATION)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        await user.save();

        // Send actual email using the utility
        await sendEmail({
            to: user.email,
            subject: "Your OTP for Password Reset",
            text: `Hello ${user.firstName},\n\nYou requested a password reset. Your OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
            html: `<p>Hello <strong>${user.firstName}</strong>,</p>
                   <p>You requested a password reset. Your OTP code is:</p>
                   <h2 style="color: #4A90E2; font-size: 24px; letter-spacing: 2px;">${otp}</h2>
                   <p>This code will expire in 10 minutes.</p>
                   <p>If you did not request this, please ignore this email.</p>`
        });

        res.status(200).json({
            success: true,
            message: "OTP sent to email address successfully",
            otp,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

router.get("/check-email", async (req, res) => {
    const { email } = req.query;

    const user = await User.findOne({ email });

    res.json({ exists: !!user });
});

router.get("/check-phone", async (req, res) => {
    const { phone } = req.query;

    const user = await User.findOne({ fullPhoneNumber: phone });

    res.json({ exists: !!user });
});

router.get("/check-idcode", async (req, res) => {
    const { idCode } = req.query;

    const user = await User.findOne({ idCode });

    res.json({ exists: !!user });
});

// RESET PASSWORD
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (email, otp, newPassword, confirmPassword)",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.resetOtp || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
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
    forgotPassword,
    resetPassword,
};
