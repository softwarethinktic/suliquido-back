const {
  Manifiesto,
  Propietario,
  Vehiculo,
  User,
  sequelize,
} = require("../models");
const { logger } = require("../utils/logger");

const manifiestoController = {
  async createOrUpdate(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { numeroManifiesto, propietario, vehiculo, ...data } = req.body;

      const cleanNumeroManifiesto = numeroManifiesto.replace(/-/g, '');

      // Check if the record exists
      let manifiesto = await Manifiesto.findOne({
      where: { numeroManifiesto: cleanNumeroManifiesto },
      transaction,
      });


      if (manifiesto) {
        // Update the existing record
        Object.keys(data).forEach((key) => {
          if (!data[key]) {
            data[key] = manifiesto[key];
          }
        });
        await manifiesto.update(data, { transaction });
        await transaction.commit();
        res.json({
          ok: true,
          msg: "Manifiesto actualizado correctamente",
          manifiesto,
        });
      } else {
        // Create a new record
        // Create the propietario and vehiculo records

        const { id: propietarioId } = await Propietario.create(
          {
            ...propietario,
          },
          { transaction }
        ).catch((error) => {
          logger.error(error);
          res.status(500).json({
            ok: false,
            msg: "Error al crear el propietario",
          });
        });
        const usuario = await User.findOne({
          where: { documentNumber: propietario.numeroDocumento },
          transaction,
        });
        if (usuario) {
          await usuario.update({ propietarioId }, { transaction });
        }
        const { id: vehiculoId } = await Vehiculo.create(
          {
            ...vehiculo,
            propietarioId,
          },
          { transaction }
        ).catch((error) => {
          logger.error(error);
          res.status(500).json({
            ok: false,
            msg: "Error al crear el vehiculo",
          });
        });

        manifiesto = await Manifiesto.create(
          {
            numeroManifiesto,
            propietarioId,
            vehiculoId,
            ...data,
          },
          { transaction }
        );
        await transaction.commit();
        res.status(201).json({
          ok: true,
          msg: "Manifiesto creado correctamente",
          manifiesto,
        });
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
      res.status(500).json({
        ok: false,
        msg: "Error al crear o actualizar el manifiesto",
      });
    }
  },
};

module.exports = manifiestoController;
