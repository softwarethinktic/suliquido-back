const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Vehiculo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tipo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        placa: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true    
        },
        propietarioId:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                model: 'Propietarios',
                key: 'id'
            }
        }
    });


};