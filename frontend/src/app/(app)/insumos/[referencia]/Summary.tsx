import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function InsumoSummary({
  cantidad,
  unidad,
  valorTotalFormatted,
  tipo,
}: {
  cantidad: string;
  unidad: string;
  valorTotalFormatted: string;
  tipo: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Resumen</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 auto-rows-fr">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-gray-800">{tipo}</div>
          <div className="text-sm text-gray-600">Tipo de insumo</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg ">
          <div className="text-xl font-bold text-blue-600">{cantidad}</div>
          <div className="text-sm text-blue-600">{unidad} disponibles</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">
            {valorTotalFormatted}
          </div>
          <div className="text-sm text-green-600">
            Valor total en inventario
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
