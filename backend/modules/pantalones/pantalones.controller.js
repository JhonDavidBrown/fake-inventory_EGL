const { calcularEstado } = require('../insumos/utils/estadoCalculator');

const createIncludeAssociations = (Insumo, ManoDeObra) => [
  {
    model: Insumo,
    as: "insumos",
    attributes: ["referencia", "nombre", "unidad", "preciounidad"],
    through: { attributes: ["cantidad_usada"] },
  },
  {
    model: ManoDeObra,
    as: "procesos",
    attributes: ["referencia", "nombre", "precio"],
    through: { attributes: [] },
  },
];

const createPantalon = async (req, res) => {
  const { Pantalon, Insumo, ManoDeObra } = req.models;

  const {
    nombre,
    imagen_url,
    tallas_disponibles,
    cantidad,
    insumos,
    manos_de_obra,
  } = req.body;

  // Validar que si tallas_disponibles es objeto, la suma coincida con cantidad
  if (typeof tallas_disponibles === 'object' && !Array.isArray(tallas_disponibles)) {
    const totalTallas = Object.values(tallas_disponibles).reduce((sum, qty) => sum + qty, 0);
    if (totalTallas !== cantidad) {
      return res.status(400).json({
        error: 'Validación de tallas',
        details: `La suma de las cantidades por talla (${totalTallas}) no coincide con la cantidad total (${cantidad}).`
      });
    }
  }

  let precio_individual = 0;
  const t = await req.sequelize.transaction();

  try {
    if (insumos && insumos.length > 0) {
      for (const insumo of insumos) {
        const insumoDB = await Insumo.findByPk(insumo.insumo_referencia, { transaction: t });
        if (insumoDB) {
          precio_individual += parseFloat(insumoDB.preciounidad) * insumo.cantidad_requerida;
        }
      }
    }

    if (manos_de_obra && manos_de_obra.length > 0) {
      for (const manoObra of manos_de_obra) {
        const manoObraDB = await ManoDeObra.findByPk(manoObra.mano_de_obra_referencia, { transaction: t });
        if (manoObraDB) {
          precio_individual += parseFloat(manoObraDB.precio);
        }
      }
    }

    const nuevoPantalon = await Pantalon.create(
      {
        nombre,
        precio_individual,
        imagen_url,
        tallas_disponibles,
        cantidad,
      },
      { transaction: t }
    );

    if (insumos && insumos.length > 0) {
      for (const insumoReceta of insumos) {
        const cantidadTotalRequerida = cantidad * insumoReceta.cantidad_requerida;
        const insumoDB = await Insumo.findByPk(insumoReceta.insumo_referencia, { transaction: t, lock: t.LOCK.UPDATE });

        if (!insumoDB) {
          throw new Error(`El insumo con referencia ${insumoReceta.insumo_referencia} no existe.`);
        }
        if (insumoDB.cantidad < cantidadTotalRequerida) {
          throw new Error(`Stock insuficiente para '${insumoDB.nombre}'. Se necesitan ${cantidadTotalRequerida}, pero solo hay ${insumoDB.cantidad}.`);
        }

        insumoDB.cantidad = parseFloat(insumoDB.cantidad) - cantidadTotalRequerida;
        // Recalcular estado después de deducir stock
        insumoDB.estado = calcularEstado(insumoDB.cantidad, insumoDB.tipo);
        await insumoDB.save({ transaction: t });

        await nuevoPantalon.addInsumo(insumoReceta.insumo_referencia, {
          through: { cantidad_usada: insumoReceta.cantidad_requerida },
          transaction: t,
        });
      }
    }

    if (manos_de_obra && manos_de_obra.length > 0) {
      for (const manoDeObra of manos_de_obra) {
        await nuevoPantalon.addProceso(manoDeObra.mano_de_obra_referencia, { transaction: t });
      }
    }

    await t.commit();

    const includeAssociations = createIncludeAssociations(Insumo, ManoDeObra);
    const resultado = await Pantalon.findByPk(nuevoPantalon.referencia, { include: includeAssociations });
    res.status(201).json(resultado);
  } catch (error) {
    await t.rollback();
    console.error("Error detallado en createPantalon:", error);
    const isProduction = process.env.NODE_ENV === 'production';

    if (error.message.startsWith("Stock insuficiente") || error.message.includes("no existe")) {
      return res.status(409).json({ error: "Conflicto de inventario", details: error.message });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Conflicto de datos", details: "Ya existe una referencia de pantalón con este nombre." });
    }
    
    res.status(500).json({ 
      error: 'Error al crear la referencia del pantalón', 
      details: isProduction ? 'Ocurrió un error inesperado en el servidor.' : error.message 
    });
  }
};

const getAllPantalones = async (req, res) => {
  const { Pantalon, Insumo, ManoDeObra } = req.models;

  try {
    const includeAssociations = createIncludeAssociations(Insumo, ManoDeObra);
    const pantalones = await Pantalon.findAll({
      include: includeAssociations,
      order: [["nombre", "ASC"]],
    });
    res.status(200).json(pantalones);
  } catch (error) {
    console.error("Error detallado en getAllPantalones:", error);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: 'Error al obtener las referencias de pantalones',
      details: isProduction ? 'Ocurrió un error inesperado en el servidor.' : error.message
    });
  }
};

const getPantalonByReferencia = async (req, res) => {
  const { Pantalon, Insumo, ManoDeObra } = req.models;

  try {
    const { referencia } = req.params;
    const includeAssociations = createIncludeAssociations(Insumo, ManoDeObra);
    const pantalon = await Pantalon.findByPk(referencia, { include: includeAssociations });

    if (!pantalon) {
      return res.status(404).json({ error: "Referencia de pantalón no encontrada" });
    }
    res.status(200).json(pantalon);
  } catch (error) {
    console.error("Error detallado en getPantalonByReferencia:", error);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: 'Error al obtener la referencia del pantalón',
      details: isProduction ? 'Ocurrió un error inesperado en el servidor.' : error.message
    });
  }
};

const updatePantalon = async (req, res) => {
  const { Pantalon, Insumo, ManoDeObra } = req.models;

  const { referencia } = req.params;
  const { nombre, imagen_url, tallas_disponibles, cantidad, insumos, manos_de_obra } = req.body;

  // Validar que si tallas_disponibles es objeto, la suma coincida con cantidad
  if (tallas_disponibles && typeof tallas_disponibles === 'object' && !Array.isArray(tallas_disponibles) && cantidad) {
    const totalTallas = Object.values(tallas_disponibles).reduce((sum, qty) => sum + qty, 0);
    if (totalTallas !== parseInt(cantidad)) {
      return res.status(400).json({
        error: 'Validación de tallas',
        details: `La suma de las cantidades por talla (${totalTallas}) no coincide con la cantidad total (${cantidad}).`
      });
    }
  }

  const t = await req.sequelize.transaction();

  try {
    const pantalon = await Pantalon.findByPk(referencia, {
      include: [{ model: Insumo, as: "insumos", through: { attributes: ["cantidad_usada"] } }],
      transaction: t,
    });

    if (!pantalon) {
      await t.rollback();
      return res.status(404).json({ error: "Referencia de pantalón no encontrada" });
    }

    const cantidadAnterior = parseInt(pantalon.cantidad);
    const cantidadNueva = parseInt(cantidad);

    if (pantalon.insumos && pantalon.insumos.length > 0) {
      for (const insumoAnterior of pantalon.insumos) {
        const cantidadTotalAnterior = cantidadAnterior * insumoAnterior.PantalonInsumo.cantidad_usada;
        const insumoDB = await Insumo.findByPk(insumoAnterior.referencia, { transaction: t, lock: t.LOCK.UPDATE });
        if (insumoDB) {
          insumoDB.cantidad = parseFloat(insumoDB.cantidad) + cantidadTotalAnterior;
          // Recalcular estado después de devolver stock
          insumoDB.estado = calcularEstado(insumoDB.cantidad, insumoDB.tipo);
          await insumoDB.save({ transaction: t });
        }
      }
    }

    let nuevoPrecioIndividual = 0;
    if (insumos && insumos.length > 0) {
      for (const insumo of insumos) {
        const insumoDB = await Insumo.findByPk(insumo.insumo_referencia, { transaction: t });
        if (insumoDB) {
          nuevoPrecioIndividual += parseFloat(insumoDB.preciounidad) * insumo.cantidad_requerida;
        }
      }
    }

    if (manos_de_obra && manos_de_obra.length > 0) {
      for (const manoObra of manos_de_obra) {
        const manoObraDB = await ManoDeObra.findByPk(manoObra.mano_de_obra_referencia, { transaction: t });
        if (manoObraDB) {
          nuevoPrecioIndividual += parseFloat(manoObraDB.precio);
        }
      }
    }

    if (insumos && insumos.length > 0) {
      for (const insumoReceta of insumos) {
        const cantidadTotalRequerida = cantidadNueva * insumoReceta.cantidad_requerida;
        const insumoDB = await Insumo.findByPk(insumoReceta.insumo_referencia, { transaction: t, lock: t.LOCK.UPDATE });

        if (!insumoDB) {
          throw new Error(`El insumo con referencia ${insumoReceta.insumo_referencia} no existe.`);
        }
        if (insumoDB.cantidad < cantidadTotalRequerida) {
          throw new Error(`Stock insuficiente para '${insumoDB.nombre}'. Se necesitan ${cantidadTotalRequerida}, pero solo hay ${insumoDB.cantidad}.`);
        }
        insumoDB.cantidad = parseFloat(insumoDB.cantidad) - cantidadTotalRequerida;
        // Recalcular estado después de deducir stock
        insumoDB.estado = calcularEstado(insumoDB.cantidad, insumoDB.tipo);
        await insumoDB.save({ transaction: t });
      }
    }

    await pantalon.update(
      {
        nombre,
        precio_individual: nuevoPrecioIndividual,
        imagen_url,
        tallas_disponibles,
        cantidad: cantidadNueva,
      },
      { transaction: t }
    );

    if (insumos) {
      await pantalon.setInsumos([], { transaction: t });
      if (insumos.length > 0) {
        for (const insumo of insumos) {
          await pantalon.addInsumo(insumo.insumo_referencia, {
            through: { cantidad_usada: insumo.cantidad_requerida },
            transaction: t,
          });
        }
      }
    }

    if (manos_de_obra) {
      const manoDeObraRefs = manos_de_obra.map((m) => m.mano_de_obra_referencia);
      await pantalon.setProcesos(manoDeObraRefs, { transaction: t });
    }

    await t.commit();

    const includeAssociations = createIncludeAssociations(Insumo, ManoDeObra);
    const resultado = await Pantalon.findByPk(referencia, { include: includeAssociations });
    res.status(200).json(resultado);
  } catch (error) {
    await t.rollback();
    console.error("Error detallado en updatePantalon:", error);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: 'Error al actualizar la referencia del pantalón',
      details: isProduction ? 'Ocurrió un error inesperado en el servidor.' : error.message
    });
  }
};

const deletePantalon = async (req, res) => {
  const { Pantalon, Insumo } = req.models;

  const t = await req.sequelize.transaction();

  try {
    const { referencia } = req.params;
    const pantalon = await Pantalon.findByPk(referencia, {
      include: [{
        model: Insumo,
        as: "insumos",
        through: { attributes: ["cantidad_usada"] },
      }],
      transaction: t,
    });

    if (!pantalon) {
      await t.rollback();
      return res.status(404).json({ error: "Referencia de pantalón no encontrada" });
    }

    const imagenUrl = pantalon.imagen_url;
    const cantidadPantalones = parseInt(pantalon.cantidad, 10) || 0;

    if (pantalon.insumos && pantalon.insumos.length > 0) {
      for (const insumoAsociado of pantalon.insumos) {
        const insumoDB = await Insumo.findByPk(insumoAsociado.referencia, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!insumoDB) {
          continue;
        }

        const cantidadUsada = parseFloat(
          insumoAsociado.PantalonInsumo.cantidad_usada
        );
        const cantidadADevolver = cantidadPantalones * cantidadUsada;
        insumoDB.cantidad =
          parseFloat(insumoDB.cantidad) + cantidadADevolver;
        insumoDB.estado = calcularEstado(insumoDB.cantidad, insumoDB.tipo);
        await insumoDB.save({ transaction: t });
      }
    }

    // Remove mano de obra associations to evitar filas huérfanas en la tabla puente
    await pantalon.setProcesos([], { transaction: t });

    await pantalon.destroy({ transaction: t });

    await t.commit();

    if (imagenUrl && imagenUrl.includes("localhost")) {
      try {
        const fs = require("fs");
        const path = require("path");
        const urlParts = imagenUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const filePath = path.join("public/uploads", fileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Local image deleted: ${fileName}`);
        }
      } catch (localError) {
        console.error("Error deleting local image:", localError);
      }
    }

    res.status(204).send();
  } catch (error) {
    await t.rollback();
    console.error("Error detallado en deletePantalon:", error);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      error: 'Error al eliminar la referencia del pantalón',
      details: isProduction ? 'Ocurrió un error inesperado en el servidor.' : error.message
    });
  }
};

module.exports = {
  createPantalon,
  getAllPantalones,
  getPantalonByReferencia,
  updatePantalon,
  deletePantalon,
};