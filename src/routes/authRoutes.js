const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("../middlewares/validateFields");
const { validateJWT, validateRole } = require("../middlewares/validateJWT");

router.post(
  "/register",
  [validateJWT, validateRole, validateRegister],
  authController.register
);
router.post("/login", validateLogin, authController.login);
router.post("/renew", [validateJWT], authController.renewToken);
// router.post("/forgot-password");
// router.post("/reset-password");

module.exports = router;
