"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// ✅ ARREGLADO: Usar el tipo centralizado en lugar de duplicar
import { Insumo } from "../types";

// Función local para formatear fechas
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '-';
  }
};

// ✅ ARREGLADO: Usar el tipo centralizado en las props
interface ColumnActions {
  onEdit: (insumo: Insumo) => void;
  onAddStock: (insumo: Insumo) => void;
  onNavigateToDetail: (referencia: string) => void;
}

const getEstadoBadge = (estado: string | null) => {
  if (!estado) return <Badge variant="secondary">Sin estado</Badge>;
  
  switch (estado.toLowerCase()) {
    case 'disponible':
      return <Badge variant="default" className="bg-green-500">Disponible</Badge>;
    case 'bajo stock':
      return <Badge variant="destructive">Bajo Stock</Badge>;
    case 'agotado':
      return <Badge variant="secondary">Agotado</Badge>;
    default:
      return <Badge variant="outline">{estado}</Badge>;
  }
};

// ✅ ARREGLADO: Usar el tipo centralizado en la definición de columnas
export const getColumns = ({ onEdit, onAddStock, onNavigateToDetail }: ColumnActions): ColumnDef<Insumo>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="px-3">
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-3">
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "referencia",
    header: ({ column }) => (
      <div className="text-center">
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Referencia <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
      </div>
    ),
    cell: ({ row }) => {
      return <div className="text-center font-medium">#{row.getValue("referencia")}</div>;
    },
  },
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nombre <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("nombre")}</div>,
  },
  {
    accessorKey: "tipo",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Tipo <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      return <Badge variant="outline">{tipo || 'Sin tipo'}</Badge>;
    },
  },
  {
    accessorKey: "preciounidad",
    header: ({ column }) => (
      <div className="text-center">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Precio Unit. <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const precio = parseFloat(row.getValue("preciounidad") as string) || 0;
      return <div className="text-center font-medium">${precio.toLocaleString()}</div>;
    },
    filterFn: (row, columnId, filterValue: [number?, number?]) => {
      const cellValue = row.getValue(columnId) as string;
      const precio = parseFloat(cellValue) || 0;
      const [min, max] = filterValue;
      
      if (min === undefined && max === undefined) return true;
      if (min !== undefined && precio < min) return false;
      if (max !== undefined && precio > max) return false;
      return true;
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "cantidad",
    header: ({ column }) => (
      <div className="text-center">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Cantidad <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const cantidad = parseFloat(row.getValue("cantidad") as string) || 0;
      return <div className="text-center">{cantidad}</div>;
    },
  },
  {
    accessorKey: "unidad",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Unidad <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const unidad = row.getValue("unidad") as string;
      return <Badge variant="outline">{unidad || 'Sin unidad'}</Badge>;
    },
  },
  {
    accessorKey: "estado",
    header: ({ column }) => (
      <div className="text-center font-medium"> Estado</div>
    ),
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      return getEstadoBadge(estado);
    },
  },
  {
    accessorKey: "valor_total",
    header: ({ column }) => (
      <div className="text-center">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Valor Total <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const cantidad = parseFloat(row.original.cantidad) || 0;
      const precio = parseFloat(row.original.preciounidad) || 0;
      const total = cantidad * precio;
      return <div className="text-center font-medium">${total.toLocaleString()}</div>;
    },
  },
  /*
  {
    accessorKey: "proveedor",
    header: "Proveedor",
    cell: ({ row }) => {
      const proveedor = row.getValue("proveedor") as string;
      return <div className="max-w-[150px] truncate">{proveedor || 'Sin proveedor'}</div>;
    },
  },
  */
  /*
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <div className="text-center">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Fecha Creación <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const fecha = row.getValue("created_at") as string;
      return <div className="text-center text-sm text-muted-foreground">{formatDate(fecha)}</div>;
    },
  },
  */
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const insumo = row.original;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6}>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onNavigateToDetail(insumo.referencia.toString())}>
              <Eye className="mr-2 h-4 w-4" /> Ver Detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(insumo)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddStock(insumo)}>
              <PackagePlus className="mr-2 h-4 w-4" /> Añadir Stock
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];