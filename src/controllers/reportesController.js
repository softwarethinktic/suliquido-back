const { Op, Sequelize } = require("sequelize");
const { Manifiesto } = require("../models");
const {
  generarPDFLiquidacion,
  generarPDFEstadoDeCuenta,
} = require("../services/generarReportes");
const emailService = require("../services/emailService");
const { logger } = require("../utils/logger");

const reportesController = {
  async generarLiquidaciónManifiestto(req, res) {
    // Send the PDF as a response
    const { idManifiesto } = req.params;
    const manifiesto = await Manifiesto.findOne({
      where: { id: idManifiesto },
      include: [{ association: "propietario" }, { association: "vehiculo" }],
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=replicated_document.pdf"
    );
    const pdf = await generarPDFLiquidacion(manifiesto);

    res.send(pdf);
  },

  async sendLiquidacionManifiestoEmail(req, res) {
    const { idManifiesto } = req.params;
    const email = req.email;

    const manifiesto = await Manifiesto.findOne({
      where: { id: idManifiesto },
      include: [{ association: "propietario" }, { association: "vehiculo" }],
    });

    const numeroManifiesto = manifiesto.numeroManifiesto.slice(3);

    const pdf = await generarPDFLiquidacion(manifiesto);

    try {
      await emailService.sendManifiestoLiquidacionEmail(
        pdf,
        email,
        numeroManifiesto
      );

      return res.status(200).json({
        ok: true,
        msg: "Correo electrónico enviado correctamente",
      });
    } catch (error) {
      logger.error(error);
      return res
        .status(500)
        .json({ ok: false, msg: "Error al enviar el correo electrónico" });
    }
  },
  async generarEstadoDeCuenta(req, res) {
    const { placas, fechaInicial, fechaFinal } = req.query;

    const numeroDocumento = req.documentNumber;

    let placasArray = [];
    if (placas) {
      placasArray = placas.split(",").map((placa) => placa.trim());
    }

    const wherePlacas =
      placasArray.length > 0 ? { placa: { [Op.in]: placasArray } } : undefined;

    const manifiestos = await Manifiesto.findAll({
      where: {
        fecha: {
          [Op.between]: [fechaInicial, fechaFinal],
        },
      },
      include: [
        {
          association: "propietario",
          where: {
            numeroDocumento,
          },
        },
        {
          association: "vehiculo",
          where: {
            placa: wherePlacas,
          },
        },
      ],
    });
    const totals = await Manifiesto.findOne({
      attributes: [
        [
          Sequelize.fn("SUM", Sequelize.col("totalLiquidacion")),
          "totalLiquidacionSum",
        ],
        [Sequelize.fn("SUM", Sequelize.col("valorFlete")), "valorFleteSum"],
      ],
      where: {
        fecha: {
          [Op.between]: [fechaInicial, fechaFinal],
        },
      },
      include: [
        {
          association: "propietario",
          where: {
            numeroDocumento,
          },
        },
        {
          association: "vehiculo",
          where: {
            placa: {
              [Op.in]: placasArray,
            },
          },
        },
      ],
      raw: true,
    });
    if (!manifiestos.length) {
      return res.status(404).send("No se encontraron manifiestos");
    }
    const propietario = manifiestos[0].propietario;
    const manifiestosEstadoDeCuenta = manifiestos.map((manifiesto) => {
      const manifiestoRutaSplitted = manifiesto.ruta.split("-");
      const formattedDate = new Date(manifiesto.fecha)
        .toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");
      return {
        ageMfto:
          manifiesto.numeroManifiesto.slice(0, 3) +
          "-" +
          manifiesto.numeroManifiesto.slice(3),
        tipMfto: manifiesto.tipoMfto,
        fecha: formattedDate,
        estado: manifiesto.estado,
        ruta:
          manifiestoRutaSplitted[0].slice(0, 5) +
          "-" +
          manifiestoRutaSplitted[1].slice(0, 5),
        placa: manifiesto.vehiculo.placa,
        tipoVeh: manifiesto.vehiculo.tipo,
        fleteCon: manifiesto.valorFlete,
        saldo: manifiesto.totalLiquidacion,
      };
    });

    const totalLiquidacion = totals.totalLiquidacionSum || 0;
    const totalFletes = totals.valorFleteSum || 0;
    // Send the PDF as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=replicated_document.pdf"
    );
    const pdf = await generarPDFEstadoDeCuenta(
      manifiestosEstadoDeCuenta,
      totalFletes,
      totalLiquidacion,
      propietario,
      fechaInicial,
      fechaFinal
    );

    res.send(pdf);
  },
};

module.exports = reportesController;
