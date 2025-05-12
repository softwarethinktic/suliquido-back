const { Op, Sequelize } = require("sequelize");
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
      const { numeroManifiesto, propietario, vehiculo, ...data } = trimValues(
        req.body
      );

      data.descuentos = trimValues(data.descuentos);

      if (data?.producto?.length > 0) {
        data.producto = data.producto.map((producto) => trimValues(producto));
      } else {
        data.producto = trimValues(data.producto);
      }

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
      page,
      size,
      sortField,
      sortOrder,
    } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereClause = {
      estado: {
        [Op.in]: ["CUMPLIDA", "LIQUIDADA"],
      },
    };

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
      const manifiestos = await Manifiesto.findAndCountAll({
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

      const response = getPagingData(manifiestos, page, limit);

      return res.json({
        ok: true,
        response,
      });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({ ok: false, msg: error.message });
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
          ...trimValues(propietario),
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
        ...trimValues(propietario),
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
          ...trimValues(vehiculo),
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
        ...trimValues(vehiculo),
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

const removeAccents = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
};

const trimValues = (obj) => {
  const trimmedObj = {};
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      trimmedObj[key] = obj[key].trim();
    } else {
      trimmedObj[key] = obj[key];
    }
  }
  return trimmedObj;
};

const getPagination = (page, size) => {
  const limit = size ? +size : 5;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: manifiestos } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, manifiestos, totalPages, currentPage, pageSize: limit };
};

module.exports = manifiestoController;
