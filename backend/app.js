const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Note: Models are now initialized dynamically per request by the middleware
// See middleware/selectCompanyMiddleware.js and modules/models.init.js

const usuarioRoutes = require("./modules/usuarios/usuario.routes");
const insumoRoutes = require("./modules/insumos/insumo.routes");
const manoDeObraRoutes = require("./modules/manoDeObra/mano_de_obra.routes");
const pantalonRoutes = require("./modules/pantalones/pantalones.routes");
const uploadRoutes = require("./modules/uploads/uploads.routes");
const selectCompanyMiddleware = require("./middleware/selectCompanyMiddleware");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Configure CORS with environment variables for flexibility across environments
const corsOrigins = process.env.CORS_ORIGIN?.split(",").map(o => o.trim()) || [
  "http://localhost:3000",    // Local frontend development
  "https://www.gestion-egl.com", // Production frontend
];
const allowedOrigins = corsOrigins; // Alias for use in other parts of the code

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization", "X-Company-Id"],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const apiRoutes = express.Router();
// Apply company selector middleware to all API routes
apiRoutes.use(selectCompanyMiddleware);
apiRoutes.use(limiter);

apiRoutes.use("/usuarios", usuarioRoutes);
apiRoutes.use("/insumos", insumoRoutes);
apiRoutes.use("/manos-de-obra", manoDeObraRoutes);
apiRoutes.use("/pantalones", pantalonRoutes);
apiRoutes.use("/uploads", uploadRoutes);


// Health check endpoint with database info
app.get("/health", (req, res) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Determine which database URL is being used
  let dbSelection = 'unknown';
  let dbInfo = 'not-set';

  if (isDevelopment) {
    dbSelection = 'DATABASE_URL_DEVELOP (Development)';
    dbInfo = process.env.DATABASE_URL_DEVELOP ? 'configured' : 'missing';
  } else if (isProduction) {
    dbSelection = 'DATABASE_URL_PROD (Production)';
    dbInfo = process.env.DATABASE_URL_PROD ? 'configured' : 'missing';
  } else {
    dbSelection = 'DATABASE_URL (Fallback)';
    dbInfo = process.env.DATABASE_URL ? 'configured' : 'missing';
  }

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    server: {
      environment: process.env.NODE_ENV || "not-set",
      port: process.env.PORT || 3001,
      origin: req.headers.origin || "no-origin",
    },
    database: {
      isDevelopment: isDevelopment,
      isProduction: isProduction,
      using: dbSelection,
      status: dbInfo,
      urlDevelopExists: !!process.env.DATABASE_URL_DEVELOP,
      urlProdExists: !!process.env.DATABASE_URL_PROD,
      urlDefaultExists: !!process.env.DATABASE_URL,
    },
    cors: {
      allowedOrigins: allowedOrigins,
      requestOrigin: req.headers.origin || "not-provided",
    },
  });
});

// Configuration debug endpoint
app.get("/config", (req, res) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(200).json({
    nodeEnv: {
      raw: process.env.NODE_ENV,
      isDevelopment: isDevelopment,
      isProduction: isProduction,
    },
    database: {
      DATABASE_URL_DEVELOP: {
        exists: !!process.env.DATABASE_URL_DEVELOP,
        host: process.env.DATABASE_URL_DEVELOP ? new URL(process.env.DATABASE_URL_DEVELOP).hostname : 'N/A',
      },
      DATABASE_URL_PROD: {
        exists: !!process.env.DATABASE_URL_PROD,
        host: process.env.DATABASE_URL_PROD ? new URL(process.env.DATABASE_URL_PROD).hostname : 'N/A',
      },
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        host: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'N/A',
      },
      selected: isDevelopment ? 'DATABASE_URL_DEVELOP' : isProduction ? 'DATABASE_URL_PROD' : 'DATABASE_URL',
    },
    cors: {
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      allowedOrigins: allowedOrigins,
    },
    server: {
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
    },
  });
});

// CORS test endpoint
app.get("/cors-test", (req, res) => {
  const origin = req.headers.origin;
  const isAllowed = !origin || allowedOrigins.indexOf(origin) !== -1;

  res.status(200).json({
    requestOrigin: origin || "no-origin",
    allowedOrigins: allowedOrigins,
    isOriginAllowed: isAllowed,
    timestamp: new Date().toISOString(),
  });
});


app.use("/api", apiRoutes);

// Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware para manejo de errores global
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);

  // No filtrar detalles del error en producción
  const isProduction = process.env.NODE_ENV === "production";
  const response = {
    error: "Error interno del servidor",
    details: isProduction ? "Ocurrió un error inesperado." : err.message,
  };

  res.status(err.status || 500).json(response);
});

module.exports = app;
