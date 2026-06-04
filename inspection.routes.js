const express = require("express");
const Inspection = require("./inspection.model");

const router = express.Router();

const generateInspectionId = () => {
    return "INS" + Math.floor(100000 + Math.random() * 900000);
};

router.post("/create", async (req, res) => {
    try {
        const { rooms } = req.body;

        const inspection = await Inspection.create({
            inspectionId: generateInspectionId(),
            rooms: rooms || [],
        });

        res.status(201).json({
            success: true,
            message: "Inspection saved successfully",
            data: inspection,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

const PDFDocument = require("pdfkit");

// GET inspection PDF by inspectionId
router.get("/pdf/:inspectionId", async (req, res) => {
    try {
        const { inspectionId } = req.params;

        const inspection = await Inspection.findOne({ inspectionId });

        if (!inspection) {
            return res.status(404).json({
                success: false,
                message: "Inspection not found",
            });
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=inspection-${inspectionId}.pdf`
        );

        doc.pipe(res);

        doc.fontSize(22).text("Inspection Report", { align: "center" });
        doc.moveDown();

        doc.fontSize(12).text(`Inspection ID: ${inspection.inspectionId}`);
        doc.text(`Created Date: ${inspection.createdAt}`);
        doc.moveDown();

        inspection.rooms.forEach((room, roomIndex) => {
            doc.fontSize(16).text(`${roomIndex + 1}. ${room.roomName}`);
            doc.fontSize(12).text(`Photos Count: ${room.photosCount}`);
            doc.moveDown(0.5);

            room.features.forEach((feature, featureIndex) => {
                doc.text(
                    `${featureIndex + 1}. ${feature.name} - Status: ${feature.status}`
                );

                if (feature.photos && feature.photos.length > 0) {
                    doc.text(`Photos: ${feature.photos.join(", ")}`);
                }
            });

            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;