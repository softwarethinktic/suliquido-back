const express = require("express");
const manifiestoController = require("../controllers/manifiestoController");
const { validateApiToken, validateJWT } = require("../middlewares/validateJWT");
const router = express.Router();

router.post("/",[validateApiToken], manifiestoController.createOrUpdate)
router.get("/query",[validateJWT], manifiestoController.queryManifiestos  )

module.exports = router;
    