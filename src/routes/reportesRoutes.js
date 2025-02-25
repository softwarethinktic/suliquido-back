const express = require("express");
const { validateApiToken, validateJWT } = require("../middlewares/validateJWT");
const reportesController = require("../controllers/reportesController");
const router = express.Router();

router.get(
  "/generar-liquidacion",
  [validateJWT],
  reportesController.generarLiquidaciónManifiestto
);

module.exports = router;
