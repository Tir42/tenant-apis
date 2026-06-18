const express = require("express");
const inspectionController = require("../controllers/inspection.controller");

const router = express.Router();

router.post("/create", inspectionController.createInspection);
router.get("/pdf/:inspectionId", inspectionController.getInspectionPdf);

module.exports = router;