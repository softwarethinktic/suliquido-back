const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Manifiesto", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numeroManifiesto: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    tipoMfto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ruta: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    producto: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    descuentos: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    valorFlete: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    valorTons:{
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    anticipos: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    reteFte: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    totalLiquidacion: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    totalOtrosDescuentos: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    observaciones: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    propietarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Propietarios",
        key: "id",
      },
    },
    vehiculoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Vehiculos",
        key: "id",
      },
    },
  });
};
