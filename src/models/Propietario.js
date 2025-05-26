const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Propietario", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numeroDocumento: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ciudad: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    celular: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    correo:{
      type: DataTypes.STRING,
      allowNull: true,
    }
  });
};
