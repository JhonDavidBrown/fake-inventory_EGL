/**
 * Script para actualizar estados de insumos existentes
 *
 * Este script recorre todos los insumos en la base de datos y calcula
 * su estado basado en la cantidad y tipo actual.
 *
 * Útil para migrar datos existentes después de implementar el cálculo
 * automático de estados.
 *
 * Uso:
 *   node backend/scripts/updateEstados.js
 */

const { calcularEstado } = require("../modules/insumos/utils/estadoCalculator");

async function updateEstados() {
  try {
    // Importar configuración de base de datos
    const sequelize = require("../config/db");
    const Insumo = require("../modules/insumos/insumo.model");

    console.log("🔄 Iniciando actualización de estados de insumos...\n");

    // Obtener todos los insumos
    const insumos = await Insumo.findAll();

    console.log(`📦 Encontrados ${insumos.length} insumos para procesar\n`);

    let actualizados = 0;
    let sinCambios = 0;
    let errores = 0;

    // Procesar cada insumo
    for (const insumo of insumos) {
      try {
        const cantidad = parseFloat(insumo.cantidad);
        const tipo = insumo.tipo;

        // Calcular nuevo estado
        const nuevoEstado = calcularEstado(cantidad, tipo);

        // Solo actualizar si el estado cambió
        if (insumo.estado !== nuevoEstado) {
          await insumo.update({ estado: nuevoEstado });

          console.log(`✅ Ref ${insumo.referencia} (${insumo.nombre}):`, {
            cantidad,
            tipo,
            estadoAnterior: insumo.estado || "null",
            estadoNuevo: nuevoEstado,
          });

          actualizados++;
        } else {
          sinCambios++;
        }
      } catch (error) {
        console.error(`❌ Error procesando Ref ${insumo.referencia}:`, error.message);
        errores++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Resumen de actualización:");
    console.log("=".repeat(60));
    console.log(`Total procesados:     ${insumos.length}`);
    console.log(`✅ Actualizados:      ${actualizados}`);
    console.log(`⏭️  Sin cambios:       ${sinCambios}`);
    console.log(`❌ Errores:           ${errores}`);
    console.log("=".repeat(60));

    // Cerrar conexión
    await sequelize.close();

    console.log("\n✅ Script completado exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error fatal ejecutando script:", error);
    process.exit(1);
  }
}

// Ejecutar script solo si se llama directamente
if (require.main === module) {
  updateEstados();
}

module.exports = { updateEstados };
