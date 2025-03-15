const otpGenerator = require("otp-generator");
const { sequelize, OTP } = require("../models");
const emailService = require("../services/emailService");
const { logger } = require("../utils/logger");
const { Op } = require("sequelize");

const otpController = {
  async otpLink(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { email, documentNumber } = req.body;

      const otp = otpGenerator.generate(200, {
        upperCaseAlphabets: true,
        specialChars: true,
      });

      deleteInvalidOtps();

      await OTP.create(
        {
          numeroDocumento: documentNumber,
          otp: otp,
          isRegisterCode: true,
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
        otp,
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
