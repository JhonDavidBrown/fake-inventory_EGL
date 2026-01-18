const clerkService = require("../services/clerk.service");

const authenticateRequest = async (req, res, next) => {
  try {
    console.log("🔐 Iniciando autenticación para:", req.method, req.path);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Token no proporcionado o formato incorrecto");
      return res
        .status(401)
        .json({
          error: "No autorizado: Token no proporcionado o formato incorrecto.",
        });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔍 Verificando token...");

    const claims = await clerkService.verifyToken(token);
    console.log("✅ Token verificado exitosamente para usuario:", claims.sub);

    req.auth = {
      userId: claims.sub,
    };

    next();
  } catch (error) {
    console.error("❌ Error en autenticación:", error.message);
    return res.status(401).json({ error: "No autorizado: Token inválido." });
  }
};

module.exports = {
  authenticateRequest,
};
