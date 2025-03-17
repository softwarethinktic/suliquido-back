const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
  validaAssignPassword,
} = require("../middlewares/validateFields");
const {
  validateJWT,
  validateOTPRegister,
  validateOTPRecoveryPassword,
} = require("../middlewares/validateJWT");

router.post(
  "/register",
  [validateOTPRegister, validateRegister],
  authController.register
);
router.post("/login", validateLogin, authController.login);
router.post("/renew", [validateJWT], authController.renewToken);
router.post(
  "/assign-password",
  [validateOTPRecoveryPassword, validaAssignPassword],
  authController.resetPassword
);

module.exports = router;
