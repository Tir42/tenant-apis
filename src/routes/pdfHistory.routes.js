const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfHistoryController = require("../controllers/pdfHistory.controller");

const router = express.Router();

// Ensure uploads folder exists (wrapped in try-catch for read-only serverless environments like Vercel)
const uploadDir = path.join(__dirname, "../../uploads");
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn("Could not create uploads directory (expected in read-only serverless environments):", err.message);
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
router.delete("/:id", pdfHistoryController.deletePdfHistory);

module.exports = router;

