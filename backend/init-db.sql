-- ==============================================================================
-- Script de Inicialización de Base de Datos - Sistema de Inventario EGL
-- ==============================================================================
-- Este script se ejecuta automáticamente cuando se crea un contenedor PostgreSQL
-- nuevo en Docker. Configura extensiones y settings básicos.
-- ==============================================================================

-- Configurar encoding y locale (esto ya se hace en docker-compose, pero por si acaso)
-- No es necesario ejecutar ALTER DATABASE aquí porque el contenedor ya lo configura

-- ==============================================================================
-- Extensiones Útiles
-- ==============================================================================

-- UUID para generar IDs únicos (opcional, si se quiere usar en el futuro)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pg_trgm para búsquedas de texto más eficientes (útil para búsquedas parciales)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==============================================================================
-- Configuración de Timezone
-- ==============================================================================
-- Establecer zona horaria por defecto (ajustar según tu región)
SET timezone = 'America/New_York';

-- ==============================================================================
-- Mensajes de Confirmación
-- ==============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Base de datos inicializada correctamente';
    RAISE NOTICE 'Extensiones instaladas: uuid-ossp, pg_trgm';
    RAISE NOTICE 'Sequelize creará las tablas automáticamente en el primer inicio';
END $$;

-- ==============================================================================
-- NOTA IMPORTANTE
-- ==============================================================================
-- Las tablas (insumos, pantalones, mano_de_obra, etc.) NO se crean aquí.
-- Sequelize las creará automáticamente cuando el backend inicie por primera vez,
-- usando los modelos definidos en backend/models/*.js
-- ==============================================================================
