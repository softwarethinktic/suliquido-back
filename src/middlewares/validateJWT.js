const { response } = require("express");
const jwt = require("jsonwebtoken");
const { User, OTP } = require("../models");
const { logger } = require("../utils/logger");
const { Op } = require("sequelize");

const validateJWT = async (req, res = response, next) => {
  // x-token headers
  const token = req?.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "No hay token en la petición",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ where: { id: payload.id } });

    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    req.id = payload.id;
    req.documentNumber = user.documentNumber;
    req.email = user.email;
    req.name = user.name;
    req.role = user.role;
  } catch (error) {
    logger.error(error);
    return res.status(401).json({
      ok: false,
      msg: "Token no válido",
    });
  }

  next();
};

const validateOTPRegister = async (req, res = response, next) => {
  const otpCode = req?.header("otp-code");

  if (!otpCode) {
    return res.status(400).json({
      ok: false,
      msg: "No hay código OTP en la petición",
    });
  }

  try {
    const otp = await OTP.findOne({
      where: {
        otp: otpCode,
        isRegisterCode: true,
        isRedeemed: false,
        expiresAt: { [Op.gte]: new Date() },
      },
    });

    if (!otp) {
      return res.status(400).json({
        ok: false,
        msg: "Código OTP no válido",
      });
    }
    req.body.email = otp.email;
    if (otp.numeroDocumento) {
      req.body.documentNumber = otp.numeroDocumento;
    }
    req.otp = otp;
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      ok: false,
      msg: "Error al validar el código OTP",
    });
  }

  next();
};

const validateOTPRecoveryPassword = async (req, res = response, next) => {
  const otpCode = req?.header("otp-code");

  if (!otpCode) {
    return res.status(400).json({
      ok: false,
      msg: "No hay código OTP en la petición",
    });
  }

  try {
    const otp = await OTP.findOne({
      where: {
        otp: otpCode,
        isRegisterCode: false,
        isRedeemed: false,
        expiresAt: { [Op.gte]: new Date() },
      },
    });

    if (!otp) {
      return res.status(400).json({
        ok: false,
        msg: "Código OTP no válido",
      });
    }

    req.body.email = otp.email;
    req.otp = otp;
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      ok: false,
      msg: "Error al validar el código OTP",
    });
  }

  next();
}

const validateApiToken = (req, res = response, next) => {
  // x-token headers
  const token = req?.header("x-token");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "No hay token en la petición",
    });
  }

  if (token !== process.env.API_KEY) {
    return res.status(401).json({
      ok: false,
      msg: "Token no válido",
    });
  }

  next();
};

const validateRole = (req, res = response, next) => {
  const { role } = req;

  if (role !== "admin") {
    return res.status(401).json({
      ok: false,
      msg: "No tienes permisos para realizar esta acción",
    });
  }

  next();
};

module.exports = {
  validateOTPRegister,
  validateOTPRecoveryPassword,
  validateJWT,
  validateApiToken,
  validateRole,
};
