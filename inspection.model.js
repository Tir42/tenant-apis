const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["good", "bad"],
        required: true,
    },
    photos: {
        type: [String],
        default: [],
    },
});

const roomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
    },
    photosCount: {
        type: Number,
        default: 0,
    },
    features: {
        type: [featureSchema],
        default: [],
    },
});

const inspectionSchema = new mongoose.Schema(
    {
        inspectionId: {
            type: String,
            required: true,
            unique: true,
        },

        rooms: {
            type: [roomSchema],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Inspection", inspectionSchema);