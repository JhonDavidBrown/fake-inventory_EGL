import { auth } from "@clerk/nextjs/server";
import { PantalonCreatePage } from "./components/PantalonCreatePage";

export const metadata = {
  title: "Crear Pantalón | EGL",
  description: "Crear nuevo pantalón - Sistema de Inventario EGL",
};

export default async function CrearPantalonPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Acceso no autorizado
          </h2>
          <p className="text-gray-600">
            Debes iniciar sesión para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  const token = await getToken();

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Error de autenticación
          </h2>
          <p className="text-gray-600">
            No se pudo obtener el token de autenticación.
          </p>
        </div>
      </div>
    );
  }

  return <PantalonCreatePage />;
}
