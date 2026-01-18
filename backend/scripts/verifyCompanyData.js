/**
 * Script para verificar qué datos hay en cada empresa
 *
 * Este script consulta ambas bases de datos y muestra:
 * - Cuántos insumos hay en cada una
 * - Cuántas manos de obra hay en cada una
 * - Cuántos pantalones hay en cada una
 *
 * Uso:
 *   node backend/scripts/verifyCompanyData.js
 */

const { getSequelize, AVAILABLE_COMPANIES } = require("../config/db");
const initializeModels = require("../modules/models.init");

async function verifyCompanyData() {
  console.log("\n" + "=".repeat(80));
  console.log("🔍 VERIFICACIÓN DE DATOS POR EMPRESA");
  console.log("=".repeat(80) + "\n");

  try {
    for (const companyId of Object.keys(AVAILABLE_COMPANIES)) {
      console.log(`\n📊 ${AVAILABLE_COMPANIES[companyId]} (${companyId})`);
      console.log("-".repeat(80));

      const sequelize = getSequelize(companyId);
      const models = initializeModels(sequelize);

      const { Insumo, ManoDeObra, Pantalon } = models;

      // Contar insumos
      const insumos = await Insumo.findAll();
      console.log(`\n  📦 Insumos: ${insumos.length} registros`);
      if (insumos.length > 0) {
        console.log(`  Primeros 5:`);
        insumos.slice(0, 5).forEach(i => {
          console.log(`    - Ref ${i.referencia}: ${i.nombre} (${i.cantidad} ${i.unidad})`);
        });
        if (insumos.length > 5) {
          console.log(`    ... y ${insumos.length - 5} más`);
        }
      }

      // Contar mano de obra
      const manosDeObra = await ManoDeObra.findAll();
      console.log(`\n  🔧 Mano de Obra: ${manosDeObra.length} registros`);
      if (manosDeObra.length > 0) {
        console.log(`  Primeros 5:`);
        manosDeObra.slice(0, 5).forEach(m => {
          console.log(`    - Ref ${m.referencia}: ${m.nombre} ($${m.precio})`);
        });
        if (manosDeObra.length > 5) {
          console.log(`    ... y ${manosDeObra.length - 5} más`);
        }
      }

      // Contar pantalones
      const pantalones = await Pantalon.findAll();
      console.log(`\n  👖 Pantalones: ${pantalones.length} registros`);
      if (pantalones.length > 0) {
        console.log(`  Primeros 5:`);
        pantalones.slice(0, 5).forEach(p => {
          console.log(`    - Ref ${p.referencia}: ${p.nombre} (${p.cantidad} unidades)`);
        });
        if (pantalones.length > 5) {
          console.log(`    ... y ${pantalones.length - 5} más`);
        }
      }

      console.log("\n" + "-".repeat(80));
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ Verificación completada");
    console.log("=".repeat(80) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error verificando datos:", error);
    process.exit(1);
  }
}

verifyCompanyData();
