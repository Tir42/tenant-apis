const PdfHistory = require("../models/pdfHistory.model");
const { uploadToR2 } = require("../utils/cloudflareR2");

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

const getPdfHistory = async (req, res) => {
  try {
    const { userName, role, userId } = req.query;
    let query = {};

    const parsedUserId = Number(userId);
    if (userId && !isNaN(parsedUserId) && parsedUserId > 0) {
      query.userId = parsedUserId;
    }

    if (role) {
      const roleFilter = role.toLowerCase();
      if (userName) {
        const nameRegex = new RegExp(userName, "i");
        if (roleFilter === "tenant") {
          query.$or = [
            { role: "tenant" },
            {
              $and: [
                { role: { $exists: false } },
                { tenantName: nameRegex }
              ]
            },
            {
              $and: [
                { role: null },
                { tenantName: nameRegex }
              ]
            }
          ];
        } else if (roleFilter === "landlord") {
          query.$or = [
            { role: "landlord" },
            {
              $and: [
                { role: { $exists: false } },
                { landlordName: nameRegex }
              ]
            },
            {
              $and: [
                { role: null },
                { landlordName: nameRegex }
              ]
            }
          ];
        }
      } else {
        query.role = roleFilter;
      }
    } else if (userName) {
      const nameRegex = new RegExp(userName, "i");
      query.$or = [{ tenantName: nameRegex }, { landlordName: nameRegex }];
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

module.exports = {
  createPdfHistory,
  getPdfHistory,
  uploadPdfHistoryCloudflare,
  updatePdfHistory,
};
