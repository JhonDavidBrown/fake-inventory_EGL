"use client";

// ============================================================================
// CLIENTE COMPONENT PARA EL MÓDULO MANO DE OBRA
// ============================================================================

import { useEffect } from "react";
import { useManoObra } from "../hooks/useManoObra";
import { useManoObraFilters } from "../hooks/useManoObraFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Trash2, RefreshCw } from "lucide-react";
import type { ManoObra } from '../types';
import { toast } from "sonner";

interface ManoObraPageClientProps {
  initialData: ManoObra[];
}

export function ManoObraPageClient({ initialData }: ManoObraPageClientProps) {
  // Hook principal de mano de obra
  const {
    data: manoObraData,
    loading,
    error,
    stats,
    refetch: refresh,
  } = useManoObra({ initialData });

  // Hook de filtros y búsqueda
  const {
    filteredData,
    filters,
    setSearch,
    setSortField,
    setSortDirection,
    clearFilters,
    hasActiveFilters,
    availableProveedores,
  } = useManoObraFilters({ data: manoObraData });

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }, [error]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mano de Obra</h1>
          <p className="text-muted-foreground">
            Gestión de servicios de mano de obra
          </p>
        </div>
        <Button disabled className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.serviciosActivos || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.costoPromedio || 0).toLocaleString('es-MX')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.costoTotal || 0).toLocaleString('es-MX')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar servicios..."
                  value={filters.search || ''}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Filtro por proveedor */}
            <Select 
              value={filters.proveedor || 'all'} 
              onValueChange={(value) => setSearch(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proveedores</SelectItem>
                {availableProveedores.map((proveedor) => (
                  <SelectItem key={proveedor} value={proveedor}>
                    {proveedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ordenamiento */}
            <Select 
              value="nombre-asc" 
              onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortField(field as keyof ManoObra);
                setSortDirection(order as 'asc' | 'desc');
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nombre-asc">Nombre (A-Z)</SelectItem>
                <SelectItem value="nombre-desc">Nombre (Z-A)</SelectItem>
                <SelectItem value="precio-asc">Precio (menor)</SelectItem>
                <SelectItem value="precio-desc">Precio (mayor)</SelectItem>
                <SelectItem value="updated_at-desc">Más recientes</SelectItem>
                <SelectItem value="updated_at-asc">Más antiguos</SelectItem>
              </SelectContent>
            </Select>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Indicadores de filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.search && (
                <Badge variant="secondary">
                  Búsqueda: &quot;{filters.search}&quot;
                </Badge>
              )}
              {filters.proveedor && (
                <Badge variant="secondary">
                  Proveedor: {filters.proveedor}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de datos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Servicios de Mano de Obra ({filteredData.length})
          </CardTitle>
          <CardDescription>
            Lista de servicios disponibles con sus respectivos costos y detalles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Adaptar ManoObraTable para usar los nuevos hooks */}
          <div className="p-4 text-center text-muted-foreground">
            <p>Tabla de Mano de Obra</p>
            <p className="text-sm">Mostrando {filteredData.length} servicios</p>
            {filteredData.length > 0 && (
              <div className="mt-4 text-left">
                {filteredData.slice(0, 3).map((item) => (
                  <div key={item.referencia} className="p-2 border rounded mb-2">
                    <div className="font-medium">{item.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.referencia} - ${item.precio.toLocaleString('es-MX')}
                    </div>
                  </div>
                ))}
                {filteredData.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    ... y {filteredData.length - 3} más
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TODO: Agregar modales para crear/editar */}
      {/* Los modales existentes se pueden adaptar para usar las nuevas funciones */}
    </div>
  );
}
