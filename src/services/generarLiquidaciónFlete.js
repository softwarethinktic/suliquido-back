const PDFDocument = require("pdfkit");

async function generarPDFLiquidacion() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margins: { top: 32.25, left: 50, right: 50, bottom: 50 },
    });

    // Generate the PDF in memory
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on("error", (err) => {
      reject(err);
    });

    // Add content to the PDF
    doc
      .font("Helvetica-Bold")
      .fontSize(11.98)
      .text("SULIQUIDO SLQ S.A.S.", { align: "center", lineGap: 5 });
    doc
      .strokeColor("black")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(500, doc.y)
      .stroke();
    doc.moveDown(0.4);
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(`Propietario:`, { align: "left", lineGap: 3, continued: true })
      .text(`BAUTISTA SOLANO MAURICIO ORLANDO`, 100, doc.y, {
        align: "left",
        continued: true,
      })
      .text(`NIT:     79.718.968`, -70, doc.y, { align: "right" });

    doc
      .text(`Direccion:`, {
        align: "left",
        lineGap: 3,
        continued: true,
      })
      .text(`VIA 40 # 53-59 LOCAL `, 106, doc.y, {
        align: "left",
      });
    doc
      .text(`Ciudad:`, {
        align: "left",
        lineGap: 3,
        continued: true,
      })
      .text(`BARRANQUILLA`, 115, doc.y, {
        align: "left",
      });
    doc
      .text(`Telefono:`, { align: "left", lineGap: 5, continued: true })
      .text("3723000", 110, doc.y, {
        align: "left",
      });
    doc
      .strokeColor("black")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(500, doc.y)
      .stroke();
    doc.moveDown(0.4);
    doc
      .text("Ruta:", { align: "left", lineGap: 3, continued: true })
      .text("CARTAGENA-BARRANQUILLA", 125, doc.y, { align: "left" });
    doc
      .text("Placa:", { align: "left", lineGap: 3, continued: true })
      .text("XLF767", 121, doc.y, { align: "left" });
    doc
      .text("Fecha:", { align: "left", lineGap: 3, continued: true })
      .text("18-11-2024", 119, doc.y, { align: "left" });
    doc
      .text("Producto:", { align: "left", lineGap: 3, continued: true })
      .text("ESPIRDANE 40", 108, doc.y, { align: "left", continued: true })
      .text("Cantidad:", 300, doc.y, { align: "left", continued: true })
      .text("1.0", 350, doc.y, { align: "left" });
    doc.moveDown();
    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`ManifiestoNº Vr.Tons Vr.Flete Anticipos ReteFte`, 50, doc.y, {
        columns: 5,
        columnGap: 32,
        width: doc.page.width - 125,
        height: 15,
        align: "left",
      });
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`001-10064506 2,400,000 1,152,000 1,100,000 18,000`, 50, doc.y, {
        columns: 5,
        columnGap: 32,
        width: doc.page.width - 125,
        height: 15,
        align: "left",
      });

    doc.moveDown();
    doc.moveDown();
    doc
      .font("Helvetica-Bold")
      .text("DESCUENTOS", { align: "left", lineGap: 5 });
    doc
      .font("Helvetica")
      .text("Otro Descuento    $", {
        align: "left",
        lineGap: 5,
        continued: true,
      })
      .text("0", -230, doc.y, { align: "right" });
    doc
      .text(`ICA                  $`, {
        align: "left",
        lineGap: 5,
        continued: true,
      })
      .text("15,408", -230, doc.y, { align: "right" });
    doc
      .text("CREE                 $", {
        align: "left",
        lineGap: 5,
        continued: true,
      })
      .text("0", -230, doc.y, { align: "right" });
    doc
      .text("Faltantes           $", {
        align: "left",
        lineGap: 5,
        continued: true,
      })
      .text("0", -230, doc.y, { align: "right" });
    doc
      .text("Prestamos          $", {
        align: "left",
        lineGap: 5,
        continued: true,
      })
      .text("0", -230, doc.y, { align: "right" });
    doc
      .text("TOTAL OTROS DESC.  $", {
        align: "left",
        lineGap: 5,
        continued: true,
      })
      .text("0", -230, doc.y, { align: "right" });
    doc
      .text("TOTAL LIQUIDACION  $", {
        align: "left",
        lineGap: 5,
        continued: true,
      })
      .text("666,592", -230, doc.y, { align: "right" });
    doc.moveDown();
    doc.moveDown();
    doc.text(
      "CUALQUIER INQUIETUD COMUNICARSE CON VIVIANA BARRERA Coordinadora de operaciones",
      { align: "left" }
    );
    doc.text("PBX: 372 30 00 - Ext. 143 - Cel. 313 5320152", { align: "left" });
    doc.text("Barranquilla, Colombia", { align: "left" });

    // Finalize the PDF and end the stream
    doc.end();
  });
}

module.exports = generarPDFLiquidacion;
