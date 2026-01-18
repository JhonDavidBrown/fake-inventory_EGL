require('dotenv').config();
const app = require("./app");
const { connectionPool, AVAILABLE_COMPANIES } = require("./config/db");
const initializeModels = require("./modules/models.init");

const PORT = process.env.PORT || 3001;

// Sincronizar todas las bases de datos
async function syncAllDatabases() {
  try {
    const companyIds = Object.keys(AVAILABLE_COMPANIES);
    console.log(`\n🔄 Sincronizando ${companyIds.length} base(s) de datos...\n`);

    for (const companyId of companyIds) {
      try {
        const sequelize = connectionPool[companyId];
        if (!sequelize) {
          console.warn(`⚠️  Connection pool for ${companyId} not found, skipping...`);
          continue;
        }

        // Inicializar modelos para esta conexión
        initializeModels(sequelize);

        // Sincronizar
        await sequelize.sync({ force: false });
        console.log(`✅ ${AVAILABLE_COMPANIES[companyId]} - Base de datos sincronizada`);
      } catch (error) {
        console.error(`❌ Error sincronizando ${companyId}:`, error.message);
        throw error;
      }
    }

    console.log(`\n📦 Todas las bases de datos sincronizadas correctamente.\n`);

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 Available companies: ${companyIds.join(", ")}`);
      console.log(`💡 Use header X-Company-Id to select company (default: egl)\n`);
    });
  } catch (error) {
    console.error("❌ Error al sincronizar las bases de datos:", error);
    process.exit(1);
  }
}

syncAllDatabases();