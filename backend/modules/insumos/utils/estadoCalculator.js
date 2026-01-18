/**
 * Calcula el estado de un insumo basado en su cantidad y tipo
 *
 * @param {number} cantidad - Cantidad disponible del insumo
 * @param {string} tipo - Tipo de insumo (Tela, Botones, etc.)
 * @returns {string} Estado calculado: 'disponible', 'bajo stock', o 'agotado'
 */
function calcularEstado(cantidad, tipo) {
  // Umbrales específicos por tipo de insumo
  // Basados en la lógica del frontend (validators.ts)
  const umbrales = {
    'Tela': { bajo: 10, agotado: 0 },
    'Botones': { bajo: 50, agotado: 0 },
    'Taches': { bajo: 20, agotado: 0 },
    'Hilos': { bajo: 5, agotado: 0 },
    'Cierres': { bajo: 25, agotado: 0 },
    'Cremalleras': { bajo: 15, agotado: 0 },
    'Elásticos': { bajo: 10, agotado: 0 },
    'Etiquetas': { bajo: 100, agotado: 0 }
  };

  // Umbral por defecto si el tipo no está en la lista
  const threshold = umbrales[tipo] || { bajo: 10, agotado: 0 };

  // Convertir cantidad a número por si viene como string
  const cantidadNum = parseFloat(cantidad);

  // Calcular estado según umbrales
  if (cantidadNum <= threshold.agotado) {
    return 'agotado';
  }

  if (cantidadNum <= threshold.bajo) {
    return 'bajo stock';
  }

  return 'disponible';
}

module.exports = {
  calcularEstado
};
