const nodemailer = require("nodemailer");
const { logger } = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    logger.info("SMTP Connection Successful");
  }
});

const emailService = {
  async sendManifiestoLiquidacionEmail(
    pdfBuffer,
    recipientEmail,
    numeroManifiesto
  ) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipientEmail,
        subject: "Liquidación de manifiesto",
        text: "Adjunto encontrará el PDF de la liquidación del manifiesto.",
        attachments: [
          {
            filename: `LIQUIDACION MF ${numeroManifiesto}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
            encoding: "base64",
          },
        ],
      });

      return true;
    } catch (error) {
      logger.error(error);
    }
  },

  //   async sendWelcomeEmail(userEmail, userName) {
  //     try {
  //       const resp = await transporter.sendMail({
  //         from: process.env.SMTP_USER,
  //         to: userEmail,
  //         subject: "¡Bienvenido/a al curso ACU!",
  //         html: `
  //                     <h1>¡Bienvenido/a ${userName}!</h1>
  //                     <p>Gracias por inscribirte en el curso de Accesibilidad Comunicativa Universal.</p>
  //                     <p> Este curso hace parte del proyecto “Accesibilidad Comunicativa Universal: co-creación de un curso virtual abierto para hacer visible lo invisible”, cuyo propósito es el de ofrecer herramientas y recursos de comunicación accesible y dignificante para el diseño y monitoreo de proyectos, programas y estrategias de inclusión que contribuyan a la promoción digna, la no discriminación, la inclusión y la igualdad, en materia de derechos de información y comunicación para personas con discapacidad.
  //                         <br><br>Recuerda que puedes complementar esta formación accediendo a los recursos adicionales disponibles en el sitio web del Observatorio Latinoamericano de Discapacidad y Comunicación OLEDIC. <a href="https://obladic.org/recursos">www.obladic.org/recursos</a></p>
  //                     <p>¡Ya puedes iniciar!  <a href="${process.env.FRONTEND_URL}/curso.html">página del curso</a> </p>
  //                     <p>Contacto: accesibilidadcomu@gmail.com </p><br><br>
  //                     <p>©2025 Universidad de Santander UDES – Todos los derechos reservados</p>
  //                 `,
  //       });
  //       console.error(resp);
  //       return true;
  //     } catch (error) {
  //       console.error("Eror al enviar correo de bienvenida", error);
  //       throw error;
  //     }
  //   },
  async sendRegistrationLink(userEmail, registrationUrl) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: userEmail,
        subject: "Enlace de registro",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Te invitamos a registrarte en la plataforma Suliquido</h2>
        <p>Presiona <a href="${registrationUrl}" style="color: #1a73e8;">aquí</a> para completar tu registro. Este enlace expirará en un día.</p>
          </div>
        `,
      });
    } catch (error) {
      logger.error("Error sending registration email", error);
    }
  },

  async sendResetPasswordEmail(userEmail, resetUrl) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: userEmail,
        subject: "Crea tu nueva contraseña",
        html: `<p>Presiona <a href="${resetUrl}">aquí</a> para generar una nueva contraseña. Este enlace expirará en cinco minutos.</p>`,
      });
    } catch (error) {
      logger.error("Error sending reset password email", error);
    }
  },
  async sendTemporalPassword() {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: userEmail,
        subject: "Credenciales temporales",
        html: `<p>Tu contraseña temporal es: ${tempPassword}. Por favor, cámbiala después de iniciar sesión.</p>`,
      });
    } catch (error) {}
  },
};

module.exports = emailService;
