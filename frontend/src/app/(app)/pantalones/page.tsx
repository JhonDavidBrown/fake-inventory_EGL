import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { PantalonesPageClient } from "./components/PantalonesPageClient";
import { Pantalon } from "./types";

// Componente de esqueleto para mejorar la experiencia de carga
function PantalonesPageSkeleton() {
  return (
    <div className="container mx-auto p-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        </div>
      </div>

      {/* Search and button skeleton */}
      <div className="flex flex-col justify-between sm:flex-row gap-4 items-start sm:items-center mb-6">
        <div className="h-10 bg-muted rounded w-full max-w-md animate-pulse" />
        <div className="h-10 bg-muted rounded w-40 animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border rounded-lg overflow-hidden animate-pulse"
          >
            <div className="p-6 pb-3">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
                <div className="h-4 bg-muted rounded w-16" />
              </div>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="h-10 bg-muted rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Pantalones | EGL",
  description: "Gestión de pantalones - Sistema de Inventario EGL",
  keywords: ["pantalones", "inventario", "gestión", "EGL"],
};

// Función para obtener los datos de los pantalones desde la API
async function getPantalonesData(): Promise<Pantalon[]> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("No autenticado");
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pantalones`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60, tags: ["pantalones"] }, // Cache con revalidación
    });

    if (!res.ok) {
      throw new Error(`Error al obtener los datos: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    // Solo log en desarrollo para debugging del server
    if (process.env.NODE_ENV === 'development') {
      console.error("Error en getPantalonesData:", error);
    }
    return []; 
  }
}

export default async function Page() {
  const initialPantalones = await getPantalonesData();

  return (
    <Suspense fallback={<PantalonesPageSkeleton />}>
      <PantalonesPageClient initialData={initialPantalones} />
    </Suspense>
  );
}
