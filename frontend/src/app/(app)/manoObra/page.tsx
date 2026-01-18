// ============================================================================
// PÁGINA PRINCIPAL DE MANO DE OBRA CON NUEVA ARQUITECTURA
// ============================================================================

import type { Metadata } from "next";
import { ManoObraPageWithHooks } from "./components";

export const metadata: Metadata = {
  title: "Mano de Obra | Sistema de Inventario EGL",
  description: "Gestión de servicios de mano de obra del sistema de inventario",
};

export default function ManoObraPage() {
  // No intentamos obtener datos en el servidor porque necesitamos autenticación
  // El cliente manejará toda la carga de datos con el token apropiado
  return (
    <ManoObraPageWithHooks initialData={[]} />
  );
}
