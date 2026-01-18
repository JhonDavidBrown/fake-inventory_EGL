# API Client Standardization Guide

This document outlines the standardized approach for making API calls throughout the application.

## Overview

The application now uses a consistent API client pattern based on the `useApi` hook, replacing direct `axios` imports for better maintainability, error handling, and authentication integration.

## Standard Pattern: useApi Hook

### Basic Usage

```typescript
import { useApi } from "@/hooks/useApi";

function MyComponent() {
  const api = useApi({ showErrorToast: true });
  
  const handleSubmit = async (data: MyData) => {
    const result = await api.post("/my-endpoint", data);
    if (result) {
      // Success handling
      console.log("Success:", result);
    }
    // Error handling is automatic via toast
  };

  return (
    <button onClick={handleSubmit} disabled={api.loading}>
      {api.loading ? "Loading..." : "Submit"}
    </button>
  );
}
```

### Benefits

1. **Automatic Authentication**: Token management handled automatically
2. **Consistent Error Handling**: Standardized error messages and toast notifications
3. **Loading States**: Built-in loading state management
4. **Type Safety**: Full TypeScript support
5. **Timeout Handling**: Configurable request timeouts

## Migration from axios

### Before (axios pattern)
```typescript
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

const { getToken } = useAuth();
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const token = await getToken();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setData(response.data);
  } catch (error) {
    console.error(error);
    toast.error("Error occurred");
  } finally {
    setLoading(false);
  }
};
```

### After (useApi pattern)
```typescript
import { useApi } from "@/hooks/useApi";

const api = useApi({ showErrorToast: true });

const fetchData = async () => {
  const result = await api.get("/endpoint");
  if (result) {
    setData(result);
  }
};
```

## Advanced Patterns

### Resource Management Hook

For CRUD operations on resources, use the `useResource` hook:

```typescript
import { useResource } from "@/hooks/useStandardApi";

interface Insumo {
  id: number;
  nombre: string;
  cantidad: number;
}

function InsumoPage() {
  const {
    data: insumos,
    loading,
    error,
    create,
    update,
    remove,
    refetch
  } = useResource<Insumo>("/insumos");

  const handleCreate = async (newInsumo: Partial<Insumo>) => {
    await create(newInsumo);
    // Automatic refetch and success toast
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {insumos.map(insumo => (
        <div key={insumo.id}>{insumo.nombre}</div>
      ))}
    </div>
  );
}
```

### Single Item Hook

For working with individual items:

```typescript
import { useResourceItem } from "@/hooks/useStandardApi";

function InsumoDetail({ id }: { id: string }) {
  const { item: insumo, loading, refetch } = useResourceItem<Insumo>("/insumos", id);

  if (loading) return <div>Loading...</div>;
  if (!insumo) return <div>Not found</div>;

  return <div>{insumo.nombre}</div>;
}
```

## Configuration Options

### useApi Options

```typescript
const api = useApi({
  showErrorToast: true,    // Show error toasts automatically (default: true)
  timeout: 10000          // Request timeout in ms (default: 10000)
});
```

### useResource Options

```typescript
const resource = useResource<T>("/endpoint", {
  showErrorToast: true,   // Show error toasts (default: true)
  autoFetch: true        // Automatically fetch on mount (default: true)
});
```

## Error Handling

### Automatic Error Handling
- Network errors are automatically caught and displayed as toast notifications
- Authentication errors trigger automatic token refresh
- Timeout errors show appropriate user messages

### Custom Error Handling
```typescript
const api = useApi({ showErrorToast: false });

const handleSubmit = async (data: MyData) => {
  const result = await api.post("/endpoint", data);
  if (!result) {
    // Handle error manually
    if (api.error?.status === 422) {
      toast.error("Validation failed");
    } else {
      toast.error("An unexpected error occurred");
    }
  }
};
```

## Migration Checklist

When migrating from axios to useApi:

1. ✅ Replace `import axios from "axios"` with `import { useApi } from "@/hooks/useApi"`
2. ✅ Remove `import { useAuth } from "@clerk/nextjs"` (handled by useApi)
3. ✅ Remove manual loading state management
4. ✅ Remove manual token handling
5. ✅ Remove manual error handling (unless custom handling needed)
6. ✅ Update button disabled states to use `api.loading`
7. ✅ Simplify try/catch blocks
8. ✅ Remove manual URL construction with `process.env.NEXT_PUBLIC_API_URL`

## Files Successfully Migrated

1. ✅ `src/app/(app)/manoObra/modales/ManoObraCreate.tsx`
2. ✅ `src/app/(app)/manoObra/page.tsx`
3. ✅ `src/hooks/useDashboardData.ts` (already using pattern)

## Files Still Using axios (To Migrate)

- `src/app/(app)/insumos/[referencia]/InsumoDetailsClient.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/manoObra/modales/ManoObraDeleteSelected.tsx`
- `src/app/(app)/manoObra/modales/ManoObraEdit.tsx`
- `src/app/(app)/insumos/modales/InsumoEdit.tsx`
- `src/app/(app)/insumos/modales/InsumoDeleteSelected.tsx`
- `src/app/(app)/insumos/modales/InsumoCreate.tsx`

## Benefits of Standardization

1. **Reduced Boilerplate**: Less code for common operations
2. **Consistent UX**: Standardized loading states and error messages
3. **Better Maintainability**: Centralized API logic
4. **Improved Testing**: Easier to mock and test API interactions
5. **Type Safety**: Better TypeScript integration
6. **Performance**: Optimized request handling and caching