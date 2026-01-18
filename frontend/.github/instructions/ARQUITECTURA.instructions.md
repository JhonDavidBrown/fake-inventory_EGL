# Guía de Arquitectura y Desarrollo del Proyecto

  ## 1. Objetivo Principal de la Arquitectura

  El objetivo es estandarizar todos los módulos de la aplicación para que sigan el patrón de diseño del módulo insumos (src/app/(app)/insumos),
  que es nuestro estándar de oro. Esto asegura un código desacoplado, con la lógica de datos centralizada y una clara separación entre componentes
   de servidor y cliente.

  ## 2. Stack Tecnológico

     Framework:* Next.js 14 (utilizando el App Router).
     Lenguaje:* TypeScript.
     UI y Estilos:* React y Tailwind CSS.
     Librería de Componentes:* Shadcn/UI.
     Autenticación:* Clerk.
     Módulos:* El proyecto utiliza ESM.

  ## 3. Dependencias y Contexto Interno

  Cualquier nuevo desarrollo debe hacer uso de los recursos compartidos existentes en src/:

     Hook Principal de Datos (`src/hooks/useStandardApi.ts`):* Es la base para la gestión de datos. Cualquier hook de módulo (como usePantalones)
  debe usar el hook genérico useResource exportado desde aquí.
     Otros Recursos Compartidos:* Se debe hacer uso de los recursos en los siguientes directorios:
      *   src/hooks/: Para hooks de UI y utilidades (ej. use-media-query).
      *   src/components/ui/: Para todos los componentes base de la UI.
      *   src/types/: Para tipos de datos globales.
      *   src/lib/: Para funciones de utilidad (ej. cn en utils.ts).

  ## 4. Patrones de Arquitectura (Instrucciones)

  1.  Analizar el Módulo de Referencia: Antes de empezar, siempre se debe examinar el módulo insumos para entender la implementación de los
  patrones.
  2.  Replicar Estructura de Archivos: La estructura de carpetas de un módulo nuevo debe replicar la de insumos (lib, hooks, table, modales,
  types).
  3.  Capa de API Desacoplada: Crear un archivo lib/api.ts que solo contenga la lógica de fetch para la comunicación con el backend.
  4.  Hook de Datos Centralizado: Crear un hook (ej. hooks/usePantalones.ts) que use useResource y el api.ts del módulo para centralizar toda la
  lógica de datos.
  5.  Patrón Cliente-Servidor: La página (page.tsx) debe ser un Server Component que carga datos iniciales y los pasa a un Client Component
  (...PageClient.tsx) que maneja la interactividad y el estado de la UI.