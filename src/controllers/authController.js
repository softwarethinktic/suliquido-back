// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, sequelize, Propietario, OTP } = require("../models");
const bcrypt = require("bcryptjs");
const { logger } = require("../utils/logger");

const authController = {
  async register(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { password, name, documentNumber, email } = req.body;
      const otp = req.otp;
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
      // Check if the Propietario exists
      const existingPropietario = await Propietario.findOne({
        where: { numeroDocumento: documentNumber },
        transaction,
      });

      // Hash password por seguridad
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = await User.create(
        {
          documentNumber,
          email,
          password: hashedPassword,
          name,
        },
        {
          transaction,
        }
      );

      await otp.update(
        {
          isRedeemed: true,
        },
        { transaction }
      );

      if (existingPropietario) {
        await user.update(
          {
            propietarioId: existingPropietario.id,
            email: existingPropietario.correo,
          },
          { transaction }
        );
      }

      await transaction.commit();
      // Generar token
      const token = jwt.sign(
        { id: user.id, documentNumber: user.documentNumber },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        ok: true,
        msg: "Usuario registrado correctamente",
        token,
        user: {
          id: user.id,
          documentNumber: user.documentNumber,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
      return res.status(500).json({
        ok: false,
        msg: "Error al registrar el usuario",
      });
    }
  },

  async login(req, res) {
    try {
      const { documentNumber, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { documentNumber } });
      if (!user) {
        return res.status(400).json({
          ok: false,
          msg: "Este documento no está registrado",
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          ok: false,
          msg: "Credenciales incorrectas",
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user.id, documentNumber: user.documentNumber },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.json({
        ok: true,
        msg: "Inicio de sesion exitoso",
        token,
        user: {
          id: user.id,
          documentNumber: user.documentNumber,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error(error);
    }
  },

  async renewToken(req, res) {
    const { id, documentNumber, email, name, role } = req;

    try {
      const token = jwt.sign({ id, documentNumber }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        ok: true,
        msg: "renew",
        user: {
          id,
          email,
          documentNumber,
          name,
          role,
        },
        token,
      });
    } catch (error) {
      logger.error(error);
    }
  },

  async resetPassword(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { email, password } = req.body;
      const otp = req.otp;

      const user = await User.findOne({ where: { email } });

      await otp.update(
        {
          isRedeemed: true,
        },
        { transaction }
      );

      const hashedPassword = await bcrypt.hash(password, 10);

      await user.update(
        {
          password: hashedPassword,
        },
        { transaction }
      );
      await transaction.commit();

      res.json({
        ok: true,
        msg: "Contraseña actualizada correctamente",
      });
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
      return res.status(500).json({
        ok: false,
        msg: "Error al registrar el usuario",
      });
    }
  },
};

module.exports = authController;
