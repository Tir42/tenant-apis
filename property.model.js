const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    idCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    registerAs: {
      type: String,
      required: true,
      default: "Tenant",
    },

    tenantName: {
      type: String,
      required: true,
      trim: true,
    },

    propertyAddress: {
      type: String,
      required: true,
      trim: true,
    },

    landName: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    possessionDate: {
      type: Date,
      required: true,
    },

    agreementDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);