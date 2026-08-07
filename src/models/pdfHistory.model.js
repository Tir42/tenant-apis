const mongoose = require("mongoose");

const pdfHistorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    tenantName: {
      type: String,
      required: true,
      trim: true,
    },
    landlordName: {
      type: String,
      required: true,
      trim: true,
    },
    propertyAddress: {
      type: String,
      required: true,
      trim: true,
    },
    inspectionDate: {
      type: String,
      required: true,
      trim: true,
    },
    idCode: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Number,
      required: false,
    },
    inspectionData: {
      type: String,
      required: false,
    },
    tenantPhone: {
      type: String,
      required: false,
      trim: true,
    },
    landlordPhone: {
      type: String,
      required: false,
      trim: true,
    },
    role: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PdfHistory", pdfHistorySchema);
