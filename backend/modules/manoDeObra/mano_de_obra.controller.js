// GET /api/manos-de-obra
const getAll = async (req, res) => {
  const { ManoDeObra } = req.models;
  try {
    const manosDeObra = await ManoDeObra.findAll({
      order: [["nombre", "ASC"]],
    });
    res.status(200).json(manosDeObra);
  } catch (error) {
    res.status(500).json({
       error: "Error al obtener la mano de obra",
       details: error.message,
      });
  }
};

// POST /api/manos-de-obra
const create = async (req, res) => {
  const { ManoDeObra } = req.models;
  try {
    const nuevaManoDeObra = await ManoDeObra.create(req.body);
    res.status(201).json(nuevaManoDeObra);
  } catch (error) {
    console.error("❌ [ManoDeObra Create Error]", {
      message: error.message,
      name: error.name,
      sql: error.sql,
      original: error.original?.message,
      stack: error.stack,
    });

    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Datos inválidos o duplicados.",
        details: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({
       error: "Error al crear la mano de obra",
       details: error.message,
       name: error.name,
      });
  }
};

// GET /api/manos-de-obra/:referencia
const getByReferencia = async (req, res) => {
  const { ManoDeObra } = req.models;
  try {
    const { referencia } = req.params;
    const manoDeObra = await ManoDeObra.findByPk(referencia);
    if (!manoDeObra) {
      return res.status(404).json({ error: "Mano de obra no encontrada" });
    }
    res.status(200).json(manoDeObra);
  } catch (error) {
    res.status(500).json({
       error: "Error al obtener la mano de obra",
       details: error.message,
      });
  }
};

// PUT /api/manos-de-obra/:referencia
const update = async (req, res) => {
  const { ManoDeObra } = req.models;
  try {
    const { referencia } = req.params;
    const manoDeObra = await ManoDeObra.findByPk(referencia);
    if (!manoDeObra) {
      return res.status(404).json({ error: "Mano de obra no encontrada" });
    }
    const registroActualizado = await manoDeObra.update(req.body);
    res.status(200).json(registroActualizado);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: "Datos inválidos.",
        details: error.errors.map((e) => e.message),
      });
    }
    res.status(500).json({
       error: "Error al actualizar la mano de obra",
       details: error.message,
      });
  }
};

// DELETE /api/manos-de-obra/:referencia
const deleteByReferencia = async (req, res) => {
  const { ManoDeObra, PantalonManoDeObra, Pantalon } = req.models;
  try {
    const { referencia } = req.params;
    const manoDeObra = await ManoDeObra.findByPk(referencia);
    if (!manoDeObra) {
      return res.status(404).json({ error: "Mano de obra no encontrada" });
    }

    // Buscar todas las relaciones con pantalones
    const usos = await PantalonManoDeObra.findAll({
      where: { referencia_mano_de_obra: referencia },
      include: [
        {
          model: Pantalon,
          attributes: ['referencia', 'nombre'],
        },
      ],
    });

    if (usos.length > 0) {
      // Construir lista de pantalones afectados
      const pantalones = usos.map(uso => ({
        referencia: uso.Pantalon.referencia,
        nombre: uso.Pantalon.nombre,
      }));

      const pantalonesStr = pantalones
        .map(p => `${p.nombre} (Ref: ${p.referencia})`)
        .join(', ');

      console.log(`⚠️ [ManoDeObra Delete] Intento de eliminar mano de obra en uso:`, {
        manoDeObra: {
          referencia: manoDeObra.referencia,
          nombre: manoDeObra.nombre,
        },
        pantalonesAfectados: pantalones.length,
        pantalones,
      });

      return res.status(409).json({
        error: `No se puede eliminar la mano de obra "${manoDeObra.nombre}" porque está siendo usada en ${pantalones.length} pantalón(es)`,
        details: {
          message: `Esta mano de obra es utilizada en: ${pantalonesStr}`,
          manoDeObra: {
            referencia: manoDeObra.referencia,
            nombre: manoDeObra.nombre,
          },
          pantalones,
          totalPantalones: pantalones.length,
          sugerencia: "Primero debes eliminar o modificar los pantalones que usan esta mano de obra.",
        },
      });
    }

    // Guardar datos antes de destruir
    const manoDeObraData = {
      referencia: manoDeObra.referencia,
      nombre: manoDeObra.nombre,
    };

    console.log(`🗑️ [ManoDeObra Delete] Eliminando mano de obra:`, manoDeObraData);

    await manoDeObra.destroy();

    res.status(200).json({
      success: true,
      message: `Mano de obra "${manoDeObraData.nombre}" eliminada correctamente`,
      data: manoDeObraData,
    });
  } catch (error) {
    console.error(`❌ [ManoDeObra Delete Error]`, {
      error: error.message,
      stack: error.stack,
      referencia: req.params.referencia,
      fullError: error,
    });

    res.status(500).json({
       error: "Error al eliminar la mano de obra",
       details: error.message,
       stack: error.stack,
      });
  }
};

module.exports = {
  getAll,
  create,
  getByReferencia,
  update,
  deleteByReferencia,
};