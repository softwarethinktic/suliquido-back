const { Sequelize } = require("sequelize");
const config = require("../config/database");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const User = require("./User")(sequelize);
const Manifiesto = require("./Manifiesto")(sequelize);
const Vehiculo = require("./Vehiculo")(sequelize);
const Propietario = require("./Propietario")(sequelize);
const OTP = require("./OTP")(sequelize);


Propietario.hasMany(Manifiesto, { foreignKey: 'propietarioId', as: 'manifiestos' });
Vehiculo.hasMany(Manifiesto, { foreignKey: 'vehiculoId', as: 'manifiestos' });
Manifiesto.belongsTo(Propietario, { foreignKey: 'propietarioId', as: 'propietario' });
Manifiesto.belongsTo(Vehiculo, { foreignKey: 'vehiculoId', as: 'vehiculo' });
Propietario.hasMany(Vehiculo, { foreignKey: 'propietarioId', as: 'vehiculos' });
Vehiculo.belongsTo(Propietario, { foreignKey: 'propietarioId', as: 'propietario' });
Propietario.hasOne(User, { foreignKey: 'propietarioId', as: 'user' });
User.belongsTo(Propietario, { foreignKey: 'propietarioId', as: 'propietario' });

module.exports = {
  User,
  Manifiesto,
  Vehiculo,
  Propietario,
  sequelize,
  OTP
};