const { Op, Sequelize } = require("sequelize");
const {
  Manifiesto,
  Propietario,
  Vehiculo,
  User,
  sequelize,
} = require("../models");
const { logger } = require("../utils/logger");

const removeAccents = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
};

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
  async queryManifiestos(req, res) {
    const {
      numeroManifiesto,
      placa,
      fecha,
      productName,
      limit,
      offset,
      sortField,
      sortOrder,
    } = req.query;

    const whereClause = {};

    if (numeroManifiesto) {
      whereClause.numeroManifiesto = numeroManifiesto;
    }

    if (fecha) {
      whereClause[Op.and] = Sequelize.literal(
        `DATE_FORMAT(fecha, '%Y-%m-%d') = '${fecha}'`
      );
    }

    if (productName) {
      const upperProductName = productName.toUpperCase();
      const removedAccentsProductName = removeAccents(upperProductName);
      const replaceAccents = (field) => `
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                UPPER(${field}),
                'Á', 'A'
              ),
              'É', 'E'
            ),
            'Í', 'I'
          ),
          'Ó', 'O'
        ),
        'Ú', 'U'
      )
    `;
      whereClause[Op.or] = [
        Sequelize.literal(
          `${replaceAccents(
            "JSON_UNQUOTE(JSON_EXTRACT(producto, '$.nombreProducto'))"
          )} LIKE '%${removedAccentsProductName}%'`
        ),
        Sequelize.literal(
          `${replaceAccents(
            "JSON_UNQUOTE(JSON_EXTRACT(producto, '$[*].nombreProducto'))"
          )} LIKE '%${removedAccentsProductName}%'`
        ),
      ];
    }

    const orderClause = [];
    if (sortField && sortOrder) {
      orderClause.push([sortField, sortOrder.toUpperCase()]);
    }

    const numeroDocumento = req.documentNumber; // Ensure this is coming from req.query
    try {
      const manifiestos = await Manifiesto.findAll({
        where: whereClause,
        include: [
          {
            model: Vehiculo,
            as: "vehiculo",
            where: placa ? { placa } : {},
            required: !!placa,
          },
          {
            model: Propietario,
            as: "propietario",
            where: numeroDocumento ? { numeroDocumento } : {},
            required: !!numeroDocumento,
          },
        ],
        limit: limit ? parseInt(limit) : 10,
        offset: offset ? parseInt(offset) : 0,
        order: orderClause.length ? orderClause : undefined,
      });

      return res.json({
        ok: true,
        manifiestos,
      });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ error: error.message });
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
