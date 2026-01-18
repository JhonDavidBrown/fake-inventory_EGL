import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface UsePantalonDeleteReturn {
  isDeleting: boolean;
  deletePantalon: (referencia: string) => Promise<void>;
}

export function usePantalonDelete(): UsePantalonDeleteReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();

  const deletePantalon = useCallback(
    async (referencia: string) => {
      setIsDeleting(true);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        const deleteApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/pantalones/${referencia}`;
        const response = await fetch(deleteApiUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Error deleting pantalón: ${response.status} ${response.statusText}`
          );
        }

        toast.success("Pantalón eliminado exitosamente");
        router.push("/pantalones");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        toast.error(`Error al eliminar pantalón: ${errorMessage}`);
        console.error("Error deleting pantalón:", err);
      } finally {
        setIsDeleting(false);
      }
    },
    [getToken, router]
  );

  return {
    isDeleting,
    deletePantalon,
  };
}
