// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { logger } = require("../utils/logger");
const { Op } = require("sequelize");

const authController = {
  async register(req, res) {
    try {
      const { documentNumber, email, password, name } = req.body;

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

      // Hash password por seguridad
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = await User.create({
        documentNumber,
        email,
        password: hashedPassword,
        name,
      });

      // Generar token
      const token = jwt.sign(
        { id: user.id, documentNumber: user.documentNumber },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      //   await emailService.sendWelcomeEmail(user.email, user.name);

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
      logger.error(error);
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

      res.json({
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
          name,
          role,
        },
        token,
      });
    } catch (error) {
      logger.error(error);
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({
          ok: false,
          msg: "No existe un usuario con ese email",
        });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });

      const resetUrl = `${process.env.FRONTEND_URL}/pages/reset-password.html?token=${token}`;

      //   await emailService.sendResetPasswordEmail(user.email, resetUrl);

      res.json({
        ok: true,
        msg: "Email enviado correctamente",
      });
    } catch (error) {
      logger.error(error);
    }
  },

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user || !!decoded.email) {
        return res.status(400).json({
          ok: false,
          msg: "Token no válido",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({
        ok: true,
        msg: "Contraseña actualizada correctamente",
      });
    } catch (error) {
      logger.error(error);
    }
  },
};

module.exports = authController;
