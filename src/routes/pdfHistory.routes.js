const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfHistoryController = require("../controllers/pdfHistory.controller");

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
const uploadToMemory = multer({ storage: multer.memoryStorage() });

router.post("/create", upload.single("pdf"), pdfHistoryController.createPdfHistory);
router.post("/upload-cloudflare", uploadToMemory.single("pdf"), pdfHistoryController.uploadPdfHistoryCloudflare);
router.get("/", pdfHistoryController.getPdfHistory);
router.put("/:id", uploadToMemory.single("pdf"), pdfHistoryController.updatePdfHistory);

module.exports = router;

