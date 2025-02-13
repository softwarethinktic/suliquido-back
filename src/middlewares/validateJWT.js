const { response } = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { logger } = require("../utils/logger");

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

module.exports = {
  validateJWT,
  validateApiToken,
};
