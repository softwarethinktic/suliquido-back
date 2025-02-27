const PDFDocument = require("pdfkit-table");

async function generarPDFLiquidacion(manifiesto) {
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

    (async function createTable() {
      // Add content to the PDF
      doc
        .font("Helvetica-Bold")
        .fontSize(11.98)
        .text("SULIQUIDO SLQ S.A.S.", { align: "center", lineGap: 5 });
      doc
        .strokeColor("black")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(510, doc.y)
        .stroke();
      doc.moveDown(0.4);
      doc
        .font("Helvetica")
        .fontSize(9)
        .text(`Propietario:`, { align: "left", lineGap: 3, continued: true })
        .text(manifiesto.propietario.nombre, 100, doc.y, {
          align: "left",
          continued: true,
        })
        .text(
          `NIT:     ${Number(
            manifiesto.propietario.numeroDocumento
          ).toLocaleString("es-ES")}`,
          -70,
          doc.y,
          { align: "right" }
        );

      doc
        .text(`Direccion:`, {
          align: "left",
          lineGap: 3,
          continued: true,
        })
        .text(manifiesto.propietario.direccion, 106, doc.y, {
          align: "left",
        });
      doc
        .text(`Ciudad:`, {
          align: "left",
          lineGap: 3,
          continued: true,
        })
        .text(manifiesto.propietario.ciudad, 115, doc.y, {
          align: "left",
        });
      doc
        .text(`Telefono:`, { align: "left", lineGap: 5, continued: true })
        .text(manifiesto.propietario.telefono, 110, doc.y, {
          align: "left",
        });
      doc
        .strokeColor("black")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(510, doc.y)
        .stroke();
      doc.moveDown(0.4);
      doc
        .text("Ruta:", { align: "left", lineGap: 3, continued: true })
        .text(manifiesto.ruta, 125, doc.y, { align: "left" });
      doc
        .text("Placa:", { align: "left", lineGap: 3, continued: true })
        .text(manifiesto.vehiculo.placa, 121, doc.y, { align: "left" });
      const formattedDate = new Date(manifiesto.fecha).toLocaleDateString(
        "es-ES"
      );
      doc
        .text("Fecha:", { align: "left", lineGap: 3, continued: true })
        .text(formattedDate, 119, doc.y, { align: "left" });

      const producto = JSON.parse(manifiesto.producto);

      if (producto?.length > 0) {
        producto.forEach((producto) => {
          doc
            .text("Producto:", { align: "left", lineGap: 3, continued: true })
            .text(producto.nombreProducto, 108, doc.y, {
              align: "left",
              continued: true,
            })
            .text("Cantidad:", 300, doc.y, { align: "left", continued: true })
            .text(producto.cantidad, 360, doc.y, { align: "left" });
        });
      } else {
        doc
          .text("Producto:", { align: "left", lineGap: 3, continued: true })
          .text(producto.nombreProducto, 108, doc.y, {
            align: "left",
            continued: true,
          })
          .text("Cantidad:", 300, doc.y, { align: "left", continued: true })
          .text(producto.cantidad, 350, doc.y, { align: "left" });
      }

      doc.moveDown();
      doc.moveDown();

      const tableHeader = {
        headers: [
          {
            align: "left",
            label: "Manifiesto N°",
            property: "nroMfto",
            headerColor: "#FFFFFF",
          },
          {
            align: "right",
            label: "Vr. Tons",
            property: "vrTons",
            headerColor: "#FFFFFF",
          },
          {
            align: "right",
            label: "Vr. Flete",
            property: "vrFlete",
            headerColor: "#FFFFFF",
          },
          {
            align: "right",
            label: "Anticipos",
            property: "anticipos",
            headerColor: "#FFFFFF",
          },
          {
            align: "right",
            label: "Rete Fte",
            property: "reteFte",
            headerColor: "#FFFFFF",
          },
        ],
        datas: [
          {
            nroMfto:
              manifiesto.numeroManifiesto.slice(0, 3) +
              "-" +
              manifiesto.numeroManifiesto.slice(3),
            vrTons: manifiesto.valorTons,
            vrFlete: manifiesto.valorFlete,
            anticipos: manifiesto.anticipos,
            reteFte: manifiesto.reteFte,
          },
        ],
      };
      await doc.table(tableHeader, {
        width: doc.page.width - 160,
        columnSpacing: 0,
        minRowHeight: 0,
        divider: {
          header: { disabled: true },
          horizontal: { disabled: true },
        },
        prepareHeader: () => {
          doc.font("Helvetica").fontSize(10);
        },
        prepareRow: () => {
          doc.font("Helvetica").fontSize(10);
        },
      });

      doc.moveDown();
      doc.moveDown();

      const descuentos = JSON.parse(manifiesto.descuentos);

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
        .text(descuentos.otroDescuento, -230, doc.y, { align: "right" });
      doc
        .text(`ICA                  $`, {
          align: "left",
          lineGap: 5,
          continued: true,
        })
        .text(descuentos.ICA, -230, doc.y, { align: "right" });
      doc
        .text("CREE                 $", {
          align: "left",
          lineGap: 5,
          continued: true,
        })
        .text(descuentos.CREE, -230, doc.y, { align: "right" });
      doc
        .text("Faltantes           $", {
          align: "left",
          lineGap: 5,
          continued: true,
        })
        .text(descuentos.faltantes, -230, doc.y, { align: "right" });
      doc
        .text("Prestamos          $", {
          align: "left",
          lineGap: 5,
          continued: true,
        })
        .text(descuentos.prestamos, -230, doc.y, { align: "right" });
      doc
        .text("TOTAL OTROS DESC.  $", {
          align: "left",
          lineGap: 5,
          continued: true,
        })
        .text(manifiesto.totalOtrosDescuentos, -230, doc.y, { align: "right" });
      doc
        .text("TOTAL LIQUIDACION  $", {
          align: "left",
          lineGap: 5,
          continued: true,
        })
        .text(manifiesto.totalLiquidacion, -230, doc.y, { align: "right" });
      doc.moveDown();
      doc.moveDown();
      doc.text(
        "CUALQUIER INQUIETUD COMUNICARSE CON VIVIANA BARRERA Coordinadora de operaciones",
        { align: "left" }
      );
      doc.text("PBX: 372 30 00 - Ext. 143 - Cel. 313 5320152", {
        align: "left",
      });
      doc.text("Barranquilla, Colombia", { align: "left" });

      // Finalize the PDF and end the stream
      doc.end();
    })();
  });
}

async function generarPDFEstadoDeCuenta(
  manifiestos,
  totalFletes,
  totalLiquidacion,
  propietario,
  fechaInicial,
  fechaFinal
) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      bufferPages: true,
      margins: { top: 165, left: 20, right: 10, bottom: 150 },
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
    (async function createTable() {
      const table = {
        headers: [
          {
            align: "center",
            label: "Age-Mfto.",
            property: "ageMfto",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Tip .Mfto.",
            property: "tipMfto",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Fecha",
            property: "fecha",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Estado",
            property: "estado",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Ruta",
            property: "ruta",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Placa",
            property: "placa",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Tipo Veh.",
            property: "tipoVeh",
            headerColor: "#FFFFFF",
          },
          {
            align: "right",
            label: "Flete Con.",
            property: "fleteCon",
            headerColor: "#FFFFFF",
            renderer: (
              value,
              indexColumn,
              indexRow,
              row,
              rectRow,
              rectCell
            ) => {
              return value.toLocaleString("en-US", {
                minimumFractionDigits: 0,
              });
            },
          },
          {
            align: "right",
            label: "Saldo",
            property: "saldo",
            headerColor: "#FFFFFF",
            renderer: (
              value,
              indexColumn,
              indexRow,
              row,
              rectRow,
              rectCell
            ) => {
              return value.toLocaleString("en-US", {
                minimumFractionDigits: 0,
              });
            },
          },
        ],
        datas: [...manifiestos],
      };

      const tableHeader = {
        headers: [
          {
            align: "center",
            label: "Age-Mfto.",
            property: "ageMfto",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Tip .Mfto.",
            property: "tipMfto",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Fecha",
            property: "fecha",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Estado",
            property: "estado",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Ruta",
            property: "ruta",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Placa",
            property: "placa",
            headerColor: "#FFFFFF",
          },
          {
            align: "center",
            label: "Tipo Veh.",
            property: "tipoVeh",
            headerColor: "#FFFFFF",
          },
          {
            align: "right",
            label: "Flete Con.",
            property: "fleteCon",
            headerColor: "#FFFFFF",
          },
          {
            align: "right",
            label: "Saldo",
            property: "saldo",
            headerColor: "#FFFFFF",
          },
        ],
        rows: [],
      };

      await doc.table(table, {
        width: doc.page.width - 52,
        hideHeader: true,
        divider: {
          header: { disabled: true },
          horizontal: { disabled: true },
        },
        columnSpacing: 0,
        minRowHeight: 0,
        padding: 0,
        prepareRow: () => {
          doc.font("Helvetica").fontSize(8.5);
        },
      });

      doc
        .strokeColor("black")
        .lineWidth(0.5)
        .moveTo(450, doc.y)
        .lineTo(582, doc.y)
        .stroke();
      doc.moveDown(0.5);
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`*** Total Propietario ***`, 160, doc.y, {
          align: "center",
          continued: true,
        });
      doc.fontSize(9.5).text(
        totalFletes.toLocaleString("en-US", {
          minimumFractionDigits: 0,
        }),
        80,
        doc.y,
        { align: "right", continued: true }
      );
      doc.fontSize(9.5).text(
        totalLiquidacion.toLocaleString("en-US", {
          minimumFractionDigits: 0,
        }),
        140,
        doc.y,
        { align: "right" }
      );
      doc.moveDown();
      doc
        .strokeColor("black")
        .lineWidth(0.15)
        .moveTo(450, doc.y)
        .lineTo(582, doc.y)
        .stroke();
      doc.moveDown(0.1);
      doc
        .strokeColor("black")
        .lineWidth(0.15)
        .moveTo(450, doc.y)
        .lineTo(582, doc.y)
        .stroke();
      doc.moveDown(0.5);
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`*** Total Empresa ***`, 160, doc.y, {
          align: "center",
          continued: true,
        });
      doc.fontSize(9.5).text(
        totalFletes.toLocaleString("en-US", {
          minimumFractionDigits: 0,
        }),
        80,
        doc.y,
        { align: "right", continued: true }
      );
      doc.fontSize(9.5).text(
        totalLiquidacion.toLocaleString("en-US", {
          minimumFractionDigits: 0,
        }),
        140,
        doc.y,
        { align: "right" }
      );

      //Global Edits to All Pages (Header/Footer, etc)
      let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        //Header: Add page number
        let oldTopMargin = 100;
        doc.page.margins.top = 0; //Dumb: Have to remove top margin in order to write into it
        doc
          .font("Times-Italic")
          .fontSize(11)
          .text(
            `${new Date(fechaInicial).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}`,
            20,
            oldTopMargin / 2,
            {
              align: "left",
              continued: true,
            }
          );

        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .text("SULIQUIDO SLQ S.A.S", 10, oldTopMargin / 2, {
            align: "center",
            continued: true,
          });
        // doc.moveDown(0.5);
        doc
          .font("Times-Italic")
          .fontSize(11)
          .text(`Pag ${i + 1}`, 0, oldTopMargin / 2, { align: "right" });
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(
            "Informes de Manifiestos por Propietario",
            50,
            oldTopMargin / 2 + 20,
            { align: "center" }
          );
        doc
          .font("Helvetica")
          .fontSize(11)
          .text(
            `Del: ${new Date(fechaInicial)
              .toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              .replace(/\//g, "-")}   Hasta: ${new Date(
              fechaFinal
            ).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}`,
            50,
            oldTopMargin / 2 + 50,
            {
              align: "center",
              characterSpacing: "-0.5",
            }
          );
        doc
          .fontSize(10)
          .text(
            `${Number(propietario.numeroDocumento).toLocaleString(
              "es-ES"
            )} - ${propietario.nombre.toUpperCase()} - ${propietario.celular}`,
            20,
            oldTopMargin / 2 + 80,
            { align: "left", lineGap: 3 }
          );

        await doc.table(tableHeader, {
          width: doc.page.width - 50,
          columnSpacing: 0,

          divider: {
            horizontal: { disabled: true },
          },
          prepareHeader: () => {
            doc.font("Helvetica").fontSize(8.5);
          },
        });

        doc.page.margins.top = oldTopMargin; // ReProtect top margin

        //Footer: Add page number
        let oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0; //Dumb: Have to remove bottom margin in order to write into it
        doc
          .strokeColor("black")
          .lineWidth(0.5)
          .moveTo(20, doc.page.height - oldBottomMargin / 2)
          .lineTo(590, doc.page.height - oldBottomMargin / 2)
          .stroke();
        doc
          .font("Helvetica")
          .fontSize(8)
          .text(
            `CONTABILID 800227828-9`,
            0,
            doc.page.height - oldBottomMargin / 2 + 5, // Centered vertically in bottom margin
            { align: "center" }
          );
        doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
      }
      doc.end();
    })();
  });
}

module.exports = { generarPDFLiquidacion, generarPDFEstadoDeCuenta };
