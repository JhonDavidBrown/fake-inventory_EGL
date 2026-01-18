import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { InsumosPageClient } from "./components/InsumosPageClient";

// ✅ CAMBIAR: Usar el tipo específico del módulo de insumos
import { Insumo } from "./types";

// Componente de esqueleto para mejorar la experiencia de carga
function InsumosPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-1/3 bg-muted animate-pulse rounded-lg" />
      <div className="h-8 w-2/3 bg-muted animate-pulse rounded" />
      <div className="h-40 bg-muted animate-pulse rounded-lg" />
      <div className="border rounded-lg">
        <div className="h-12 bg-muted animate-pulse rounded-t-lg" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-16 border-t bg-muted/50 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Insumos | EGL",
  description: "Gestión de insumos y materiales - Sistema de Inventario EGL",
};

// Función para obtener los datos de los insumos desde la API
async function getInsumosData(): Promise<Insumo[]> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("No autenticado");
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/insumos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60, tags: ["insumos"] }, // Cache con revalidación
    });

    if (!res.ok) {
      throw new Error(`Error al obtener los datos: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    // ❌ MANTENER SOLO EN DESARROLLO - Este puede ser útil para debugging del server
    if (process.env.NODE_ENV === 'development') {
      console.error("Error en getInsumosData:", error);
    }
    return []; 
  }
}

export default async function Page() {
  const initialInsumos = await getInsumosData();

  return (
    <Suspense fallback={<InsumosPageSkeleton />}>
      <InsumosPageClient initialData={initialInsumos} />
    </Suspense>
  );
}