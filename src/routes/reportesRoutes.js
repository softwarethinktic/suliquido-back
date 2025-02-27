const express = require("express");
const { validateApiToken, validateJWT } = require("../middlewares/validateJWT");
const reportesController = require("../controllers/reportesController");
const router = express.Router();

router.get(
  "/generar-liquidacion/:idManifiesto",
  [validateJWT],
  reportesController.generarLiquidaciónManifiestto
);
router.get(
  "/generar-estado-cuenta",
  [validateJWT],
  reportesController.generarEstadoDeCuenta
);

module.exports = router;
