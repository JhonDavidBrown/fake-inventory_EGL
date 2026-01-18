"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface ManoObra {
  referencia: string;
  nombre: string;
  precio: number;
  proveedor?: string;
  created_at?: string;
  updated_at?: string;
}

const formatDate = (date: string | undefined) => {
  if (!date) {
    return "No registrada";
  }

  let dateString = date;
  if (date.includes(" ") && !date.includes("T")) {
    dateString = date.replace(" ", "T");
    if (dateString.endsWith("+00")) {
      dateString = dateString.replace("+00", "Z");
    }
  }

  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) {
    return "Fecha inválida";
  }

  return dateObj.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

export const getColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (row: ManoObra) => void;
  onDelete: (row: ManoObra) => void;
}): ColumnDef<ManoObra>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    accessorKey: "referencia",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Referencia
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium min-w-[80px]">
        {row.original.referencia}
      </div>
    ),
    size: 60,
  },
  {
    accessorKey: "nombre ",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre del Proceso
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.nombre}
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "precio",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Precio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium min-w-[80px]">
        {formatCurrency(row.original.precio)}
      </div>
    ),
    filterFn: (row, columnId, filterValue: [number?, number?]) => {
      const value = Number(row.getValue(columnId));
      const [min, max] = filterValue;
      if (min !== undefined && value < min) return false;
      if (max !== undefined && value > max) return false;
      return true;
    },
    enableColumnFilter: true,
    size: 120,
  },
  {
    accessorKey: "proveedor",
    header: ({ column }) => (
      <div className="text-center hidden sm:table-cell">
        <Button
          variant="ghost"
          className="hidden sm:inline-flex"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Proveedor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center hidden sm:table-cell max-w-[100px] sm:max-w-[150px] truncate text-muted-foreground">
        {row.original.proveedor || "Sin proveedor"}
      </div>
    ),
    size: 150,
  },
  /*
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <div className="text-center hidden lg:table-cell">
        <Button
          variant="ghost"
          className="hidden lg:inline-flex"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Última actualización
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center hidden lg:table-cell text-muted-foreground text-xs">
        {formatDate(row.getValue("updated_at"))}
      </div>
    ),
    size: 130,
  },*/
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const manoObra = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(manoObra)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(manoObra)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 80,
  },
];
