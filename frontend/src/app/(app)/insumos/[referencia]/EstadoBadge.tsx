import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

export function EstadoBadge({ estado }: { estado: string | null }) {
  if (!estado) return <Badge variant="secondary">Sin estado</Badge>;

  switch (estado.toLowerCase()) {
    case "disponible":
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Disponible
        </Badge>
      );
    case "agotado":
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Agotado
        </Badge>
      );
    case "bajo stock":
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
          <AlertCircle className="w-3 h-3 mr-1" />
          Bajo stock
        </Badge>
      );
    default:
      return <Badge variant="secondary">{estado}</Badge>;
  }
}
