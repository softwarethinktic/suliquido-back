const { Manifiesto, Propietario, Vehiculo } = require("../models");
const { logger } = require("../utils/logger");

const manifiestoController = {
  async createOrUpdate(req, res) {
    try {
      const { numeroManifiesto, propietario, vehiculo, ...data } = req.body;

      // Check if the record exists
      let manifiesto = await Manifiesto.findOne({
        where: { numeroManifiesto },
      });

      if (manifiesto) {
        // Update the existing record
        Object.keys(data).forEach((key) => {
          if (!data[key]) {
            data[key] = manifiesto[key];
          }
        });
        await manifiesto.update(data);
        res.json({
          ok: true,
          msg: "Manifiesto actualizado correctamente",
          manifiesto,
        });
      } else {
        // Create a new record
        // Create the propietario and vehiculo records
        const { id: propietarioId } = await Propietario.create({
          ...propietario,
        }).catch((error) => {
          logger.error(error);
          res.status(500).json({
            ok: false,
            msg: "Error al crear el propietario",
          });
        });
        const { id: vehiculoId } = await Vehiculo.create({
          ...vehiculo,
          propietarioId,
        }).catch((error) => {
          logger.error(error);
          res.status(500).json({
            ok: false,
            msg: "Error al crear el vehiculo",
          });
        });

        manifiesto = await Manifiesto.create({
          numeroManifiesto,
          propietarioId,
          vehiculoId,
          ...data,
        });
        res.status(201).json({
          ok: true,
          msg: "Manifiesto creado correctamente",
          manifiesto,
        });
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json({
        ok: false,
        msg: "Error al crear o actualizar el manifiesto",
      });
    }
  },
};

module.exports = manifiestoController;
