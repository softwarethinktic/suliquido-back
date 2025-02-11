const express = require("express");
const router = express.Router();
// const authController = require("../controllers/authController");

router.post("/register", [], (req, res) => {
  res.json({ message: "Register" });
});
router.post("/login");
router.post("/renew");
router.post("/forgot-password");
router.post("/reset-password");

module.exports = router;
