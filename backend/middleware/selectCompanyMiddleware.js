const { getSequelize, AVAILABLE_COMPANIES } = require("../config/db");
const initializeModels = require("../modules/models.init");

/**
 * Middleware que selecciona la conexión de base de datos según la empresa
 * Lee el header X-Company-Id y asigna la conexión correcta a req.sequelize
 * También inicializa los modelos para esa conexión
 */
const selectCompanyMiddleware = (req, res, next) => {
  // Obtener companyId del header (por defecto 'egl')
  const rawHeader = req.headers['x-company-id'];
  const companyId = (rawHeader || 'egl').toLowerCase();

  // Log de headers recibidos
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [selectCompanyMiddleware] Inicio del middleware`, {
      endpoint: `${req.method} ${req.path}`,
      rawXCompanyIdHeader: rawHeader,
      companyIdResolved: companyId,
      allHeaders: Object.keys(req.headers).filter(h => h.includes('company') || h.includes('x-')),
      timestamp: new Date().toISOString(),
    });
  }

  // Validar que la empresa existe
  if (!AVAILABLE_COMPANIES[companyId]) {
    console.error(`❌ [selectCompanyMiddleware] Empresa inválida: ${companyId}`);
    return res.status(400).json({
      error: "Invalid company ID",
      message: `Company '${companyId}' not found. Available: ${Object.keys(AVAILABLE_COMPANIES).join(", ")}`,
      available: Object.keys(AVAILABLE_COMPANIES),
    });
  }

  try {
    // Obtener la instancia de Sequelize para la empresa
    const sequelize = getSequelize(companyId);

    // Inicializar modelos para esta conexión
    const models = initializeModels(sequelize);

    // Inyectar en el request
    req.sequelize = sequelize;
    req.models = models;
    req.companyId = companyId;
    req.companyName = AVAILABLE_COMPANIES[companyId];

    // Log de debug detallado
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [selectCompanyMiddleware] Conexión establecida para empresa: ${req.companyName} (${companyId})`, {
        endpoint: `${req.method} ${req.path}`,
        dbInitialized: !!sequelize,
        modelsCount: Object.keys(models).length,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  } catch (error) {
    console.error(`💥 [selectCompanyMiddleware] Error en middleware:`, error);
    return res.status(500).json({
      error: "Database connection error",
      message: error.message,
      details: error.message,
    });
  }
};

module.exports = selectCompanyMiddleware;
