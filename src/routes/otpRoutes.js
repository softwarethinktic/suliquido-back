const express = require("express");
const {
  validateJWT,
  validateRole,
  validateOTPRegister,
} = require("../middlewares/validateJWT");
const { validateSendEmail } = require("../middlewares/validateFields");
const otpController = require("../controllers/otpController");
const router = express.Router();

router.post(
  "/send-register-link",
  [validateJWT, validateRole, validateSendEmail],
  otpController.otpLink
);

router.get("/validate", [validateOTPRegister], otpController.validateOtp);

module.exports = router;
