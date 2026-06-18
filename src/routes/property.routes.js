const express = require("express");
const propertyController = require("../controllers/property.controller");

const router = express.Router();

router.post("/create", propertyController.createProperty);

module.exports = router;