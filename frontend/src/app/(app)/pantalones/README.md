# Módulo Pantalones - Documentación

## Arquitectura Refactorizada

Este módulo ha sido refactorizado para seguir el patrón de arquitectura del módulo `insumos`, manteniendo la interfaz de usuario existente pero aplicando los principios de diseño establecidos.

## Estructura de Archivos

```
src/app/(app)/pantalones/
├── components/
│   ├── PantalonesPageClient.tsx     # Client Component principal
│   ├── PantalonesPageEnhanced.tsx   # Versión mejorada (ejemplo)
│   └── PantalonStats.tsx            # Componente de estadísticas
├── hooks/
│   ├── usePantalones.ts             # Hook principal usando useStandardApi
│   ├── usePantalonFilters.ts        # Hook para filtros y ordenamiento
│   └── index.ts                     # Barrel exports
├── lib/
│   ├── api.ts                       # Lógica de API desacoplada
│   ├── formatters.ts                # Funciones de formateo
│   └── index.ts                     # Barrel exports
├── types/
│   ├── pantalon.types.ts            # Tipos específicos del módulo
│   └── index.ts                     # Barrel exports
├── table/                           # Para futuras vistas de tabla
├── modales/                         # Para futuros modales
└── page.tsx                         # Server Component
```

## Patrones Aplicados

### 1. Server-Client Pattern
- **page.tsx**: Server Component que carga datos iniciales
- **PantalonesPageClient.tsx**: Client Component que maneja la interactividad

### 2. Hook Centralizado
- **usePantalones**: Usa `useStandardApi` para operaciones CRUD
- Centraliza toda la lógica de datos del módulo
- Proporciona estadísticas calculadas

### 3. API Desacoplada
- **lib/api.ts**: Contiene toda la lógica de comunicación con el backend
- Funciones puras sin efectos secundarios de UI
- Manejo consistente de errores

### 4. Tipos Específicos
- **types/**: Tipos TypeScript específicos del módulo
- Funciones utilitarias incluidas
- Validaciones y constantes

## Uso Básico

### En un Server Component
```tsx
import { getPantalonesData } from './lib/api';

export default async function Page() {
  const initialData = await getPantalonesData();
  return <PantalonesPageClient initialData={initialData} />;
}
```

### En un Client Component
```tsx
import { usePantalones } from './hooks';

function MyComponent({ initialData }) {
  const { 
    data, 
    dataWithPrices, 
    loading, 
    createPantalon, 
    updatePantalon,
    stats 
  } = usePantalones({ initialData });
  
  // Tu lógica aquí...
}
```

## Características Principales

### 1. Compatibilidad Completa
- Mantiene la interfaz de usuario existente
- Compatible con componentes legacy (`PantalonesGridAPI`)
- Funciones de adaptación de tipos incluidas

### 2. Datos en Tiempo Real
- Auto-refetch en focus/visibilidad
- Cache inteligente con revalidación
- Manejo optimista de operaciones

### 3. Estadísticas Integradas
- Cálculo automático de métricas
- Estadísticas de stock, valor y variedad
- Componente de visualización incluido

### 4. Filtros y Ordenamiento
- Hook `usePantalonFilters` para filtros avanzados
- Ordenamiento por múltiples campos
- Estado de filtros persistente

## API Disponible

### Hook Principal: usePantalones
```tsx
const {
  data,                    // Pantalon[] - datos sin procesar
  dataWithPrices,         // PantalonWithPrice[] - con precios calculados
  loading,                // boolean - estado de carga
  error,                  // any - errores
  stats,                  // PantalonStats | null - estadísticas
  createPantalon,         // función para crear
  updatePantalon,         // función para actualizar
  deletePantalon,         // función para eliminar
  deleteMultiplePantalones, // función para eliminar múltiples
  refetch,                // función para recargar datos
} = usePantalones({ initialData });
```

### Hook de Filtros: usePantalonFilters
```tsx
const {
  filters,                // PantalonFilters - filtros actuales
  sortOptions,           // PantalonSortOptions - ordenamiento
  setSearch,             // función para búsqueda
  setTalla,              // función para filtrar por talla
  setPrecioRange,        // función para rango de precios
  clearFilters,          // función para limpiar filtros
  applyFilters,          // función para aplicar filtros
  hasActiveFilters,      // boolean - si hay filtros activos
} = usePantalonFilters();
```

## Migración desde el Sistema Anterior

### 1. Reemplazar usePantalonesAPI
```tsx
// Antes
import { usePantalonesAPI } from '@/hooks/usePantalonesAPI';
const { pantalonesWithPrices, loading, error, refetch } = usePantalonesAPI();

// Después
import { usePantalones } from './hooks';
const { dataWithPrices, loading, error, refetch } = usePantalones({ initialData });
```

### 2. Adaptar Tipos
Los tipos legacy siguen siendo compatibles, pero se recomienda migrar gradualmente a los nuevos tipos del módulo.

### 3. Server Components
Los page.tsx ahora cargan datos iniciales para mejor performance y SEO.

## Extensibilidad

### Agregar Nuevas Operaciones
1. Agregar función en `lib/api.ts`
2. Agregar método en el hook `usePantalones`
3. Exportar desde `hooks/index.ts`

### Agregar Filtros
1. Extender `PantalonFilters` en types
2. Agregar lógica en `usePantalonFilters`
3. Agregar funciones utilitarias en types

### Componentes Adicionales
- Crear en `components/`
- Usar hooks del módulo
- Seguir patrones establecidos

## Beneficios de la Refactorización

1. **Consistencia**: Sigue el mismo patrón que el módulo insumos
2. **Mantenibilidad**: Código más organizado y predecible
3. **Performance**: Server Components + Client Components optimizado
4. **Escalabilidad**: Estructura preparada para crecimiento futuro
5. **Developer Experience**: Mejor tipado y herramientas de desarrollo
6. **UI Preservation**: Mantiene la interfaz que ya funciona bien
