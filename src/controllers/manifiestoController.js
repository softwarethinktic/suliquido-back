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

      const cleanNumeroManifiesto = numeroManifiesto.replace(/-/g, "");

      // Check if the record exists
      let manifiesto = await Manifiesto.findOne({
        where: { numeroManifiesto: cleanNumeroManifiesto },
      });

      if (manifiesto) {
        // Update the existing record

        // Create or update the propietario
        const propietarioId = await createOrUpdatePropietario(
          propietario,
          transaction
        );
        // Create or update the vehiculo
        const vehiculoId = await createOrUpdateVehicle(
          vehiculo,
          propietarioId,
          transaction
        );
        Object.keys(data).forEach((key) => {
          if (data[key] === null) {
            data[key] = manifiesto[key];
          }
        });
        // Update the manifiesto vehiculo and propietario in case they changed
        await manifiesto.update(
          { propietarioId, vehiculoId, ...data },
          { transaction }
        );
        await transaction.commit();
        res.json({
          ok: true,
          msg: "Manifiesto actualizado correctamente",
        });
      } else {
        // Create or update the propietario
        const propietarioId = await createOrUpdatePropietario(
          propietario,
          transaction
        );

        // Create or update the vehiculo
        const vehiculoId = await createOrUpdateVehicle(
          vehiculo,
          propietarioId,
          transaction
        );
        // Create the manifiesto
        manifiesto = await Manifiesto.create(
          {
            numeroManifiesto: cleanNumeroManifiesto,
            propietarioId,
            vehiculoId,
            ...data,
          },
          { transaction }
        );
        await transaction.commit();
        return res.status(201).json({
          ok: true,
          msg: "Manifiesto creado correctamente",
        });
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
      return res.status(500).json({
        ok: false,
        msg: "Error al crear o actualizar el manifiesto",
      });
    }
  },
};

const createOrUpdatePropietario = async (propietario, transaction) => {
  // Find if exists the propietario
  const propietarioDb = await Propietario.findOne({
    where: { numeroDocumento: propietario.numeroDocumento },
  });
  if (propietarioDb) {
    await propietarioDb
      .update(
        {
          ...propietario,
        },
        { transaction }
      )
      .catch(async (error) => {
        logger.error(error);
        await transaction.rollback();
        return res.status(500).json({
          ok: false,
          msg: "Error al actualizar el propietario",
        });
      });

    return propietarioDb.id;
  } else {
    const { id } = await Propietario.create(
      {
        ...propietario,
      },
      { transaction }
    ).catch(async (error) => {
      logger.error(error);
      await transaction.rollback();
      return res.status(500).json({
        ok: false,
        msg: "Error al crear el propietario",
      });
    });

    const usuario = await User.findOne({
      where: { documentNumber: propietario.numeroDocumento },
    });
    if (usuario) {
      await usuario.update({ id }, { transaction });
    }
    return id;
  }
};
const createOrUpdateVehicle = async (vehiculo, propietarioId, transaction) => {
  // Find if exists the vehiculo
  const vehiculoDb = await Vehiculo.findOne({
    where: { placa: vehiculo.placa },
  });

  // Create or update the vehiculo
  if (vehiculoDb) {
    await vehiculoDb
      .update(
        {
          ...vehiculo,
          propietarioId,
        },
        { transaction }
      )
      .catch(async (error) => {
        logger.error(error);
        await transaction.rollback();
        return res.status(500).json({
          ok: false,
          msg: "Error al actualizar el vehiculo",
        });
      });
    return vehiculoDb.id;
  } else {
    const { id } = await Vehiculo.create(
      {
        ...vehiculo,
        propietarioId,
      },
      { transaction }
    ).catch(async (error) => {
      logger.error(error);
      await transaction.rollback();

      return res.status(500).json({
        ok: false,
        msg: "Error al crear el vehiculo",
      });
    });

    return id;
  }
};

module.exports = manifiestoController;
