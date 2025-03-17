const express = require("express");
const {
  validateJWT,
  validateRole,
  validateOTPRegister,
  validateOTPRecoveryPassword,
} = require("../middlewares/validateJWT");
const {
  validateSendEmail,
  validateEmail,
} = require("../middlewares/validateFields");
const otpController = require("../controllers/otpController");
const { otpLimiter } = require("../middlewares/limiter");
const router = express.Router();

router.post(
  "/send-register-link",
  [validateJWT, validateRole, validateSendEmail],
  otpController.otpLink
);

router.post(
  "/send-recovery-link",
  [validateEmail, otpLimiter],
  otpController.otpLinkRecovery
);

router.get("/validate", [validateOTPRegister], otpController.validateOtp);
router.get(
  "/validate-otp-password",
  [validateOTPRecoveryPassword],
  otpController.validateOtp
);

module.exports = router;
