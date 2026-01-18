const dotenv = require('dotenv');

dotenv.config();

const { Sequelize } = require("sequelize");

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Debug: Mostrar variables de entorno disponibles
console.log('\n' + '='.repeat(80));
console.log('🔍 MULTI-COMPANY DATABASE CONFIGURATION');
console.log('='.repeat(80));
console.log(`📌 NODE_ENV value: "${process.env.NODE_ENV}"`);
console.log(`📌 isDevelopment: ${isDevelopment}`);
console.log(`📌 isProduction: ${isProduction}`);

// Pool de conexiones (una por empresa)
const connectionPool = {};

// Configurar empresas disponibles
const AVAILABLE_COMPANIES = {
  egl: 'EGL',
  empresa2: 'Empresa 2',
};

/**
 * Obtiene la URL de base de datos para una empresa específica
 * @param {string} companyId - ID de la empresa (ej: 'egl', 'empresa2')
 * @returns {string} URL de conexión a la base de datos
 */
const getDatabaseUrl = (companyId = 'egl') => {
  const upperCaseId = companyId.toUpperCase();

  if (isDevelopment) {
    return process.env[`DATABASE_URL_DEVELOP_${upperCaseId}`] ||
           process.env.DATABASE_URL_DEVELOP ||
           process.env.DATABASE_URL;
  }

  if (isProduction) {
    return process.env[`DATABASE_URL_PROD_${upperCaseId}`] ||
           process.env.DATABASE_URL_PROD ||
           process.env.DATABASE_URL;
  }

  // Fallback para otros entornos
  return process.env[`DATABASE_URL_${upperCaseId}`] || process.env.DATABASE_URL;
};

// Extraer información del host para el log (sin exponer credenciales)
const getDbHostInfo = (url) => {
  if (!url) return 'unknown';
  try {
    const urlObj = new URL(url);
    return `${urlObj.hostname} (${urlObj.pathname || '/database'})`;
  } catch {
    return 'invalid-url';
  }
};

// Crear instancia de Sequelize para una empresa
const createSequelizeInstance = (companyId) => {
  if (connectionPool[companyId]) {
    return connectionPool[companyId];
  }

  const databaseUrl = getDatabaseUrl(companyId);

  if (!databaseUrl) {
    throw new Error(`No database URL found for company: ${companyId}`);
  }

  console.log(`🗄️  ${AVAILABLE_COMPANIES[companyId] || companyId} - Host: ${getDbHostInfo(databaseUrl)}`);

  const sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: isDevelopment ? console.log : false,
    family: 4,
  });

  connectionPool[companyId] = sequelize;
  return sequelize;
};

// Inicializar todas las conexiones disponibles
Object.keys(AVAILABLE_COMPANIES).forEach(companyId => {
  try {
    createSequelizeInstance(companyId);
  } catch (error) {
    console.warn(`⚠️  Could not initialize connection for ${companyId}: ${error.message}`);
  }
});

console.log(`✅ Database connections initialized`);
console.log(`📝 Available companies: ${Object.keys(AVAILABLE_COMPANIES).join(', ')}`);
console.log('='.repeat(80) + '\n');

/**
 * Obtiene la instancia de Sequelize para una empresa
 * @param {string} companyId - ID de la empresa (por defecto: 'egl')
 * @returns {Sequelize} Instancia de Sequelize
 */
const getSequelize = (companyId = 'egl') => {
  if (!connectionPool[companyId]) {
    throw new Error(`Database connection not configured for company: ${companyId}`);
  }
  return connectionPool[companyId];
};

// Compatibilidad: exportar instancia por defecto de EGL
module.exports = getSequelize('egl');

// Exportar funciones útiles
module.exports.getSequelize = getSequelize;
module.exports.getDatabaseUrl = getDatabaseUrl;
module.exports.AVAILABLE_COMPANIES = AVAILABLE_COMPANIES;
module.exports.connectionPool = connectionPool;