const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middlewares/validateFields");

router.post("/register", validateRegister, authController.register);
router.post("/login",validateLogin ,authController.login);
router.post("/renew");
router.post("/forgot-password");
router.post("/reset-password");

module.exports = router;
