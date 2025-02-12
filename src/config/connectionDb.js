const { sequelize } = require('../models');
const {logger} = require('../utils/logger');



const dbConnection = async () => {  
    try {
        await sequelize.sync({alter: false});
        logger.info('Connection has been established successfully.');
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
    }
}

module.exports = dbConnection;