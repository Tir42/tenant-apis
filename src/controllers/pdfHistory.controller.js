const fs = require("fs");
const path = require("path");
const PdfHistory = require("../models/pdfHistory.model");
const { uploadToR2 } = require("../utils/cloudflareR2");

// create pdf history api
const createPdfHistory = async (req, res) => {
  try {
    const {
      title,
      date,
      status,
      tenantName,
      landlordName,
      propertyAddress,
      inspectionDate,
      idCode,
      userId,
      tenantPhone,
      landlordPhone,
      role,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const pdfHistory = await PdfHistory.create({
      title,
      date,
      status: status || "VERIFIED",
      pdfUrl: `/uploads/${req.file.filename}`,
      tenantName,
      landlordName,
      propertyAddress,
      inspectionDate,
      idCode,
      userId: userId ? Number(userId) : undefined,
      tenantPhone,
      landlordPhone,
      role,
    });

    res.status(201).json({
      success: true,
      message: "PDF history saved successfully",
      data: pdfHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get history list api
const getPdfHistory = async (req, res) => {
  try {
    const { userName, role, userId } = req.query;
    let query = {};
    const parsedUserId = Number(userId);

    if (role) {
      const roleFilter = role.toLowerCase();
      
      let roleConditions = [];
      if (roleFilter === "tenant") {
        roleConditions = [
          { role: "tenant" },
          { role: { $exists: false } },
          { role: null }
        ];
      } else if (roleFilter === "landlord") {
        roleConditions = [
          { role: "landlord" }
        ];
      }

      let userConditions = [];
      if (userId && !isNaN(parsedUserId) && parsedUserId > 0) {
        userConditions.push({ userId: parsedUserId });
      }
      if (userName) {
        const nameRegex = new RegExp(userName, "i");
        if (roleFilter === "tenant") {
          userConditions.push({ tenantName: nameRegex });
        } else if (roleFilter === "landlord") {
          userConditions.push({ landlordName: nameRegex });
        }
      }

      query.$and = [
        { $or: roleConditions }
      ];

      if (userConditions.length > 0) {
        query.$and.push({ $or: userConditions });
      }
    } else {
      if (userId && !isNaN(parsedUserId) && parsedUserId > 0) {
        query.userId = parsedUserId;
      }
      if (userName) {
        const nameRegex = new RegExp(userName, "i");
        query.$or = [{ tenantName: nameRegex }, { landlordName: nameRegex }];
      }
    }

    const history = await PdfHistory.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// upload pdf history to cloudflare api
const uploadPdfHistoryCloudflare = async (req, res) => {
  try {
    const {
      title,
      date,
      status,
      tenantName,
      landlordName,
      propertyAddress,
      inspectionDate,
      idCode,
      userId,
      inspectionData,
      tenantPhone,
      landlordPhone,
      role,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const pdfUrl = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);

    const pdfHistory = await PdfHistory.create({
      title,
      date,
      status: status || "VERIFIED",
      pdfUrl,
      tenantName,
      landlordName,
      propertyAddress,
      inspectionDate,
      idCode,
      userId: userId ? Number(userId) : undefined,
      inspectionData,
      tenantPhone,
      landlordPhone,
      role,
    });

    res.status(201).json({
      success: true,
      message: "PDF uploaded to Cloudflare and history saved successfully",
      data: pdfHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Update History
const updatePdfHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      date,
      status,
      tenantName,
      landlordName,
      propertyAddress,
      inspectionDate,
      idCode,
      inspectionData,
      tenantPhone,
      landlordPhone,
      role,
    } = req.body;

    let updateData = {
      title,
      date,
      status,
      tenantName,
      landlordName,
      propertyAddress,
      inspectionDate,
      idCode,
      tenantPhone,
      landlordPhone,
      role,
    };

    if (inspectionData) {
      updateData.inspectionData = inspectionData;
    }

    if (req.file) {
      const pdfUrl = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype || "application/pdf");
      updateData.pdfUrl = pdfUrl;
    }

    const pdfHistory = await PdfHistory.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!pdfHistory) {
      return res.status(404).json({
        success: false,
        message: "PDF history record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "PDF history updated successfully",
      data: pdfHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// History delete api 
const deletePdfHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const pdfHistory = await PdfHistory.findById(id);

    if (!pdfHistory) {
      return res.status(404).json({
        success: false,
        message: "PDF history record not found",
      });
    }

    // Try deleting local file if it's a local upload
    if (pdfHistory.pdfUrl && pdfHistory.pdfUrl.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "../..", pdfHistory.pdfUrl);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Failed to delete local file:", err);
        } else {
          console.log("Successfully deleted local file:", filePath);
        }
      });
    }

    await PdfHistory.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "PDF history record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPdfHistory,
  getPdfHistory,
  uploadPdfHistoryCloudflare,
  updatePdfHistory,
  deletePdfHistory,
};
