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
    valorTons: {
      type: DataTypes.FLOAT,
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
    },
    anticipos: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    reteFte: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalLiquidacion: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
