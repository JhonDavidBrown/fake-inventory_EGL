import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PantalonAPIWithPrice } from "@/types/pantalones";

interface InsumoAPI {
  referencia: number;
  nombre: string;
  tipo: string;
  preciounidad: string;
  cantidad: number;
}

interface ManoObraAPI {
  referencia: number;
  nombre: string;
  descripcion?: string;
  precio: number;
}

interface UsePantalonEditDataReturn {
  // Data states
  pantalon: PantalonAPIWithPrice | null;
  insumos: InsumoAPI[];
  manosDeObra: ManoObraAPI[];
  
  // Loading states
  loadingData: boolean;
  
  // Actions
  loadPantalonData: () => Promise<void>;
  loadAvailableData: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

export function usePantalonEditData(referencia: string): UsePantalonEditDataReturn {
  const { getToken } = useAuth();
  const router = useRouter();
  
  // Data states
  const [pantalon, setPantalon] = useState<PantalonAPIWithPrice | null>(null);
  const [insumos, setInsumos] = useState<InsumoAPI[]>([]);
  const [manosDeObra, setManosDeObra] = useState<ManoObraAPI[]>([]);
  
  // Loading states
  const [loadingData, setLoadingData] = useState(true);

  const loadPantalonData = useCallback(async () => {
    try {
      setLoadingData(true);
      const token = await getToken();
      
      if (!token) {
        toast.error("No se pudo obtener el token de autenticación");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pantalones/${referencia}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar los datos del pantalón");
      }

      const data = await response.json();
      setPantalon(data);

      return data;
    } catch (error) {
      console.error("Error loading pantalon:", error);
      toast.error("Error al cargar los datos del pantalón");
      router.push("/pantalones");
      throw error;
    } finally {
      setLoadingData(false);
    }
  }, [referencia, getToken, router]);

  const loadAvailableData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // Load insumos and manos de obra in parallel
      const [insumosResponse, manoObraResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/insumos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/manos-de-obra`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      ]);

      if (insumosResponse.ok) {
        const insumosData = await insumosResponse.json();
        setInsumos(insumosData as InsumoAPI[]);
      }

      if (manoObraResponse.ok) {
        const manoObraData = await manoObraResponse.json();
        setManosDeObra(manoObraData as ManoObraAPI[]);
      }
    } catch (error) {
      console.error("Error loading available data:", error);
      toast.error("Error al cargar los datos disponibles");
    }
  }, [getToken]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      loadPantalonData(),
      loadAvailableData()
    ]);
  }, [loadPantalonData, loadAvailableData]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadPantalonData();
        await loadAvailableData();
      } catch {
        // Error handling is done in individual functions
      }
    };

    loadData();
  }, [loadPantalonData, loadAvailableData]);

  return {
    // Data
    pantalon,
    insumos,
    manosDeObra,
    
    // Loading states
    loadingData,
    
    // Actions
    loadPantalonData,
    loadAvailableData,
    refetchAll,
  };
}
