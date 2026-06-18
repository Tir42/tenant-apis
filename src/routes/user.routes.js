const express = require("express");
const userController = require("../controllers/user.controller");

const router = express.Router();

// REGISTER USER
router.post("/register", userController.registerUser);

// LOGIN USER
router.post("/login", userController.loginUser);

module.exports = router;