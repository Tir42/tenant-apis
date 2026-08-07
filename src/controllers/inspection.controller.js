const Inspection = require("../models/inspection.model");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInspectionId = () => {
    return "INS" + Math.floor(100000 + Math.random() * 900000);
};

const createInspection = async (req, res) => {
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
};

const getInspectionPdf = async (req, res) => {
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
                    doc.moveDown(0.5);
                    feature.photos.forEach((photoPath) => {
                        const cleanPath = photoPath.startsWith("/") ? photoPath.slice(1) : photoPath;
                        const fullPath = path.join(process.cwd(), cleanPath);

                        if (fs.existsSync(fullPath)) {
                            try {
                                const img = doc.openImage(fullPath);
                                const isLandscape = img.width > img.height;

                                const fitWidth = isLandscape ? 300 : 200;
                                const fitHeight = isLandscape ? 200 : 300;

                                const ratio = Math.min(fitWidth / img.width, fitHeight / img.height);
                                const renderedHeight = img.height * ratio;

                                const spaceRemaining = doc.page.height - doc.page.margins.bottom - doc.y;
                                if (spaceRemaining < renderedHeight + 30) {
                                    doc.addPage();
                                }

                                doc.image(fullPath, {
                                    fit: [fitWidth, fitHeight],
                                    align: "center"
                                });
                                doc.y += renderedHeight + 10;
                            } catch (imgErr) {
                                console.error("Error drawing image in PDF:", imgErr);
                                doc.fontSize(10).fillColor("red").text(`[Error loading photo: ${path.basename(photoPath)}]`).fillColor("black");
                            }
                        } else {
                            doc.fontSize(10).fillColor("red").text(`[Photo file not found: ${path.basename(photoPath)}]`).fillColor("black");
                        }
                    });
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
};

module.exports = {
    createInspection,
    getInspectionPdf,
};
