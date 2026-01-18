const { verifyToken: clerkVerifyToken } = require("@clerk/backend");

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("La variable de entorno CLERK_SECRET_KEY no está definida.");
}

/**
 * Verifica un token de sesión de Clerk
 * @param {string} token - El token JWT extraído de la cabecera de la petición
 * @returns {Promise<object>} - El payload del token si es válido
 * @throws {Error} - Si el token es inválido o ha expirado.
 */
const verifyToken = async (token) => {
  try {
    console.log("🔍 Iniciando verificación de token con Clerk...");
    const startTime = Date.now();

    const claims = await Promise.race([
      clerkVerifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout en verificación de token")),
          8000
        )
      ),
    ]);

    const duration = Date.now() - startTime;
    console.log(`✅ Token verificado en ${duration}ms`);
    return claims;
  } catch (error) {
    console.error("❌ Error al verificar el token de Clerk:", error.message);
    throw new Error("Token de autenticación inválido.");
  }
};

module.exports = {
  verifyToken,
};
