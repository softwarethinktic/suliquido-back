const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateRegister = [
  body("documentNumber")
    .notEmpty()
    .withMessage("El número de documento es requerido"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("name").notEmpty().trim().withMessage("El nombre es requerido"),
  handleValidationErrors,
];

exports.validateLogin = [
  body("documentNumber")
    .notEmpty()
    .withMessage("El número de documento es requerido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
  handleValidationErrors,
];

exports.validateSendEmail = [
  body("email").isEmail().withMessage("Email inválido"),
  body("documentNumber")
    .notEmpty()
    .withMessage("El número de documento es requerido"),
  handleValidationErrors,
];

exports.validateEmail = [
  body("email").isEmail().withMessage("Email inválido"),
  handleValidationErrors,
];

exports.validaAssignPassword = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  handleValidationErrors,
];
