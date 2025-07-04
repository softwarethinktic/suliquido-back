const otpGenerator = require("otp-generator");
const { sequelize, OTP, User } = require("../models");
const emailService = require("../services/emailService");
const { logger } = require("../utils/logger");
const { Op } = require("sequelize");

const otpController = {
  async otpLink(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { email, documentNumber } = req.body;

      // ¿El usuario existe? validacion
      const existingUserDocumentNumber = await User.findOne({
        where: {
          documentNumber,
        },
      });

      const existingUserEmail = await User.findOne({
        where: {
          email,
        },
      });

      if (existingUserDocumentNumber) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe un usuario con ese número de documento",
        });
      } else if (existingUserEmail) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe un usuario con ese email",
        });
      }

      const otp = otpGenerator.generate(200, {
        upperCaseAlphabets: true,
        specialChars: false,
      });

      await OTP.create(
        {
          numeroDocumento: documentNumber,
          otp: otp,
          isRegisterCode: true,
          email,
          // Set expiration time to 1 day from now
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        {
          transaction,
        }
      );

      const registrationLink = `${process.env.FRONTEND_URL}/auth/register?otp=${otp}`;
      await emailService.sendRegistrationLink(email, registrationLink);

      await transaction.commit();
      return res.status(200).json({
        ok: true,
        msg: "Enlace de registro enviado correctamente",
      });
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
      return res.status(500).json({
        ok: false,
        msg: "Error al enviar el enlace de registro",
      });
    }
  },
  async otpLinkRecovery(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { email } = req.body;
      const existingUserEmail = await User.findOne({
        where: {
          email,
        },
      });

      if (!existingUserEmail) {
        return res.status(400).json({
          ok: false,
          msg: "No existe un usuario con ese email",
        });
      }
      const otp = otpGenerator.generate(200, {
        upperCaseAlphabets: true,
        specialChars: false,
      });

      await OTP.create(
        {
          otp,
          email,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          // Set expiration time to 1 day from now
        },
        {
          transaction,
        }
      );

      const assignLink = `${process.env.FRONTEND_URL}/auth/assign-password?otp=${otp}`;
      await emailService.sendResetPasswordEmail(email, assignLink);

      await transaction.commit();
      return res.status(200).json({
        ok: true,
        msg: "Email enviado correctamente",
      });
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
      return res.status(500).json({
        ok: false,
        msg: "Error al enviar el correo",
      });
    }
  },

  async validateOtp(req, res) {
    try {
      return res.status(200).json({
        ok: true,
        msg: "OTP validado correctamente",
      });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        ok: false,
        msg: "Error validating OTP",
      });
    }
  },
};

const deleteInvalidOtps = async () => {
  try {
    const now = new Date();
    await OTP.destroy({
      where: {
        [Op.or]: [
          {
            expiration: {
              [sequelize.Op.lt]: now,
            },
          },
          {
            isRedeemed: true,
          },
        ],
      },
    });
    logger.info("Invalid OTPs deleted successfully");
  } catch (error) {
    logger.error("Error deleting invalid OTPs: ", error);
  }
};

module.exports = otpController;
