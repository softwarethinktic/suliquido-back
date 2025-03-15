const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("OTP", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numeroDocumento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRegisterCode:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRedeemed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // This field determines if the OTP has been used or not
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false, // This field determines when the OTP expires
      defaultValue: new Date(new Date().getTime() + 5 * 60000), // This field determines when the OTP expires
    },
  });
};
