const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            unique: true,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        fullPhoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        idCode: {
            type: String,
            required: true,
            trim: true,
        },

        resetOtp: {
            type: String,
            trim: true,
        },

        resetOtpExpires: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);