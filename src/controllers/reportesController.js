const generarPDFLiquidacion = require("../services/generarLiquidaciónFlete");

const reportesController = {
  async generarLiquidaciónManifiestto(req, res) {
    // Send the PDF as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=replicated_document.pdf"
    );
    const pdf = await generarPDFLiquidacion();

    res.send(pdf);
  },
};

module.exports = reportesController;
