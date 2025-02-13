const express = require("express");
const manifiestoController = require("../controllers/manifiestoController");
const router = express.Router();

router.post("/", manifiestoController.createOrUpdate)

module.exports = router;
    