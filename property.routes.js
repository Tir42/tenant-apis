const express = require("express");
const Property = require("./property.model");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const {
      idCode,
      registerAs,
      tenantName,
      propertyAddress,
      landName,
      possessionDate,
      agreementDate,
    } = req.body;

    if (
      !idCode ||
      !tenantName ||
      !propertyAddress ||
      !possessionDate ||
      !agreementDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const property = await Property.create({
      idCode,
      registerAs: registerAs || "Tenant",
      tenantName,
      propertyAddress,
      landName: landName || "",
      possessionDate,
      agreementDate,
    });

    res.status(201).json({
      success: true,
      message: "Property details saved successfully",
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;