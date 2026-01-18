import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Package, Ruler, Tag } from "lucide-react";
import { EstadoBadge } from "./EstadoBadge";
import { Insumo } from "../types";

interface Props {
  insumo: Insumo;
  formatCurrency: (n: number | string) => string;
  formatDate: (d: string) => string;
  valorTotal: number;
}

export default function InsumoMainCard({
  insumo,
  formatCurrency,
  formatDate,
  valorTotal,
}: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <CardTitle className="text-2xl font-bold">
              {insumo.nombre}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-base">
              Referencia: #{insumo.referencia}
            </CardDescription>
          </div>
          <EstadoBadge estado={insumo.estado} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Tipo:</span>
              <Badge variant="outline">{insumo.tipo}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Cantidad:
              </span>
              <span className="font-bold text-base">
                {insumo.cantidad} {insumo.unidad}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Proveedor:
              </span>
              <span className="font-bold text-base">{insumo.proveedor}</span>
            </div>
          </div>

          {/* Columna 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Precio unitario:
              </span>
              <span className="font-bold text-base">
                {formatCurrency(insumo.preciounidad)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Valor total:
              </span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Información de registro */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Información de Registro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Creado:</span>
                <span className="text-sm">{formatDate(insumo.created_at)}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Actualizado:</span>
                <span className="text-sm">{formatDate(insumo.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
