const { calcularEstado } = require("./utils/estadoCalculator");

const getAllInsumos = async (req, res) => {
  try {
    const { Insumo } = req.models;
    const insumos = await Insumo.findAll({
      order: [["referencia", "asc"]],
    });
    res.status(200).json(insumos);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener los insumos", details: error.message });
  }
};

const createInsumo = async (req, res) => {
  try {
    console.log("📝 [Insumo Create] Iniciando creación con datos:", {
      body: req.body,
      company: req.companyId,
      timestamp: new Date().toISOString(),
    });

    const { Insumo } = req.models;

    // Calcular estado automáticamente basado en cantidad y tipo
    const { cantidad, tipo } = req.body;
    const estado = calcularEstado(cantidad, tipo);

    console.log("🔄 [Insumo Create] Estado calculado:", {
      cantidad,
      tipo,
      estado,
    });

    const nuevoInsumo = await Insumo.create({
      ...req.body,
      estado,
    });

    console.log("✅ [Insumo Create] Insumo creado exitosamente:", {
      referencia: nuevoInsumo.referencia,
      nombre: nuevoInsumo.nombre,
      estado: nuevoInsumo.estado,
      company: req.companyId,
    });

    res.status(201).json(nuevoInsumo);
  } catch (error) {
    console.error("❌ [Insumo Create Error]", {
      message: error.message,
      name: error.name,
      sql: error.sql,
      original: error.original?.message,
      company: req.companyId,
      timestamp: new Date().toISOString(),
    });

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: "Datos inválidos",
        details: error.errors.map((e) => e.message),
      });
    }
    res
      .status(500)
      .json({ error: "Error al crear el insumo", details: error.message });
  }
};

const updateInsumo = async (req, res) => {
  try {
    const { Insumo } = req.models;
    const { referencia } = req.params;
    const insumo = await Insumo.findByPk(referencia);

    if (!insumo) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }

    if (req.body.referencia) {
      delete req.body.referencia;
    }

    // Recalcular estado si cambia cantidad o tipo
    const cantidadFinal = req.body.cantidad !== undefined
      ? parseFloat(req.body.cantidad)
      : parseFloat(insumo.cantidad);

    const tipoFinal = req.body.tipo || insumo.tipo;

    const nuevoEstado = calcularEstado(cantidadFinal, tipoFinal);

    console.log("🔄 [Insumo Update] Estado recalculado:", {
      referencia,
      cantidadAnterior: insumo.cantidad,
      cantidadNueva: cantidadFinal,
      tipoAnterior: insumo.tipo,
      tipoNuevo: tipoFinal,
      estadoAnterior: insumo.estado,
      estadoNuevo: nuevoEstado,
    });

    const insumoActualizado = await insumo.update({
      ...req.body,
      estado: nuevoEstado,
    });

    res.status(200).json(insumoActualizado);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: "Datos inválidos",
        details: error.errors.map((e) => e.message),
      });
    }
    res
      .status(500)
      .json({ error: "Error al actualizar el insumo", details: error.message });
  }
};

const deleteInsumo = async (req, res) => {
  try {
    console.log(`🔍 [Insumo Delete] Inicio - referencia: ${req.params.referencia}`);
    const { Insumo, PantalonInsumo, Pantalon } = req.models;
    const { referencia } = req.params;

    console.log(`🔍 [Insumo Delete] Buscando insumo con referencia: ${referencia}`);
    const insumo = await Insumo.findByPk(referencia);

    if (!insumo) {
      console.log(`❌ [Insumo Delete] Insumo no encontrado: ${referencia}`);
      return res.status(404).json({ error: "Insumo no encontrado" });
    }

    console.log(`✅ [Insumo Delete] Insumo encontrado:`, {
      referencia: insumo.referencia,
      nombre: insumo.nombre,
      dataValues: insumo.dataValues
    });

    // Buscar todas las relaciones con pantalones
    console.log(`🔍 [Insumo Delete] Buscando relaciones con pantalones para referencia: ${referencia}`);
    const usos = await PantalonInsumo.findAll({
      where: { referencia_insumo: referencia },
      include: [
        {
          model: Pantalon,
          attributes: ['referencia', 'nombre'],
        },
      ],
    });

    console.log(`📊 [Insumo Delete] Relaciones encontradas: ${usos.length}`, {
      usos: usos.map(u => ({
        pantalon_ref: u.referencia_pantalon,
        pantalon_nombre: u.Pantalon?.nombre,
        cantidad_usada: u.cantidad_usada
      }))
    });

    if (usos.length > 0) {
      // Construir lista de pantalones afectados
      const pantalones = usos.map(uso => ({
        referencia: uso.Pantalon.referencia,
        nombre: uso.Pantalon.nombre,
        cantidadUsada: uso.cantidad_usada,
      }));

      const pantalonesStr = pantalones
        .map(p => `${p.nombre} (Ref: ${p.referencia})`)
        .join(', ');

      console.log(`⚠️ [Insumo Delete] Intento de eliminar insumo en uso:`, {
        insumo: {
          referencia: insumo.referencia,
          nombre: insumo.nombre,
        },
        pantalonesAfectados: pantalones.length,
        pantalones,
      });

      return res.status(409).json({
        error: `No se puede eliminar el insumo "${insumo.nombre}" porque está siendo usado en ${pantalones.length} pantalón(es)`,
        details: {
          message: `Este insumo es utilizado en: ${pantalonesStr}`,
          insumo: {
            referencia: insumo.referencia,
            nombre: insumo.nombre,
          },
          pantalones,
          totalPantalones: pantalones.length,
          sugerencia: "Primero debes eliminar o modificar los pantalones que usan este insumo.",
        },
      });
    }

    // Guardar datos antes de destruir
    const insumoData = {
      referencia: insumo.referencia,
      nombre: insumo.nombre,
    };

    console.log(`🗑️ [Insumo Delete] Eliminando insumo:`, insumoData);

    await insumo.destroy();

    res.status(200).json({
      success: true,
      message: `Insumo "${insumoData.nombre}" eliminado correctamente`,
      data: insumoData,
    });
  } catch (error) {
    console.error(`❌ [Insumo Delete Error]`, {
      error: error.message,
      stack: error.stack,
      referencia: req.params.referencia,
      fullError: error,
    });

    res
      .status(500)
      .json({ error: "Error al eliminar el insumo", details: error.message, stack: error.stack });
  }
};

const getInsumoByReferencia = async (req, res) => {
  try {
    const { Insumo } = req.models;
    const { referencia } = req.params;
    const insumo = await Insumo.findByPk(referencia);
    if (!insumo) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }
    res.status(200).json(insumo);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener el insumo", details: error.message });
  }
};

const addStock = async (req, res, next) => {
  try {
    const { Insumo } = req.models;
    const sequelize = req.sequelize;
    const t = await sequelize.transaction();

    try {
      const { referencia } = req.params;
      const { cantidadComprada, precioDeCompra } = req.body;

      const insumo = await Insumo.findByPk(referencia, { transaction: t });

      if (!insumo) {
        await t.rollback();
        return res.status(404).json({ error: "Insumo no encontrado" });
      }

      const cantidadActual = parseFloat(insumo.cantidad);
      const precioActual = parseFloat(insumo.preciounidad);

      const valorStockExistente = cantidadActual * precioActual;
      const valorStockNuevo = cantidadComprada * precioDeCompra;

      const nuevaCantidadTotal = cantidadActual + cantidadComprada;

      const nuevoPrecioPonderado = (nuevaCantidadTotal > 0)
        ? (valorStockExistente + valorStockNuevo) / nuevaCantidadTotal
        : precioDeCompra;

      // Calcular nuevo estado basado en la cantidad actualizada
      const nuevoEstado = calcularEstado(nuevaCantidadTotal, insumo.tipo);

      console.log("🔄 [Insumo AddStock] Estado recalculado:", {
        referencia,
        cantidadAnterior: cantidadActual,
        cantidadNueva: nuevaCantidadTotal,
        estadoAnterior: insumo.estado,
        estadoNuevo: nuevoEstado,
      });

      const insumoActualizado = await insumo.update({
        cantidad: nuevaCantidadTotal,
        preciounidad: nuevoPrecioPonderado.toFixed(2),
        estado: nuevoEstado,
      }, { transaction: t });

      await t.commit();

      res.status(200).json(insumoActualizado);

    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInsumos,
  createInsumo,
  updateInsumo,
  deleteInsumo,
  getInsumoByReferencia,
  addStock
};
