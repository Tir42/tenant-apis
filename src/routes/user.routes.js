const express = require("express");
const userController = require("../controllers/user.controller");

const router = express.Router();

// REGISTER USER
router.post("/register", userController.registerUser);

// LOGIN USER
router.post("/login", userController.loginUser);

// FORGOT PASSWORD
router.post("/forgot-password", userController.forgotPassword);

// RESET PASSWORD
router.post("/reset-password", userController.resetPassword);

// CHECK EMAIL
router.get("/check-email", userController.checkEmail);

// CHECK PHONE
router.get("/check-phone", userController.checkPhone);

// CHECK ID CODE
router.get("/check-idcode", userController.checkIdCode);

module.exports = router;