import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InsumoSeleccionado {
  referencia: string;
  cantidad_usada: number;
}

interface ManoObraSeleccionada {
  referencia: string;
}

interface FormData {
  nombre: string;
  cantidad: number;
  tallasSeleccionadas: string[];
  insumosSeleccionados: InsumoSeleccionado[];
  manosDeObraSeleccionadas: ManoObraSeleccionada[];
  imageFile?: File | null;
}

interface UsePantalonSubmitOptions {
  referencia: string;
  pantalon: { imagen_url: string } | null;
}

interface UsePantalonSubmitReturn {
  loading: boolean;
  submitPantalon: (formData: FormData) => Promise<void>;
}

export function usePantalonSubmit({ referencia, pantalon }: UsePantalonSubmitOptions): UsePantalonSubmitReturn {
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const uploadImage = useCallback(async (imageFile: File): Promise<string | null> => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token available");

      const formData = new FormData();
      formData.append("image", imageFile);

      const uploadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        return uploadData.imageUrl;
      }
      
      return null;
    } catch (error) {
      console.warn("Failed to upload image:", error);
      toast.warning("No se pudo subir la nueva imagen, se mantendrá la anterior");
      return null;
    }
  }, [getToken]);

  const submitPantalon = useCallback(async (formData: FormData) => {
    if (!pantalon) {
      toast.error("No hay datos del pantalón para actualizar");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        throw new Error("No authentication token available");
      }

      let imageUrl = pantalon.imagen_url;

      // Upload new image if provided
      if (formData.imageFile) {
        const uploadedUrl = await uploadImage(formData.imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Prepare update data
      const updateData = {
        nombre: formData.nombre,
        cantidad: formData.cantidad,
        imagen_url: imageUrl,
        tallas_disponibles: formData.tallasSeleccionadas,
        insumos: formData.insumosSeleccionados.map((insumo) => ({
          insumo_referencia: insumo.referencia,
          cantidad_requerida: insumo.cantidad_usada
        })),
        manos_de_obra: formData.manosDeObraSeleccionadas.map((manoObra) => ({
          mano_de_obra_referencia: manoObra.referencia
        }))
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pantalones/${referencia}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      toast.success("Pantalón actualizado exitosamente");
      router.push("/pantalones");
    } catch (error) {
      console.error("Error updating pantalon:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el pantalón"
      );
    } finally {
      setLoading(false);
    }
  }, [pantalon, getToken, referencia, router, uploadImage]);

  return {
    loading,
    submitPantalon,
  };
}
