'use client';

import { useEffect, useContext } from 'react';
import { CompanyContext } from '@/context/CompanyContext';
import { apiClient } from '@/lib/api-client';

/**
 * Componente que inicializa el apiClient con el getter de companyId
 * Maneja casos donde no está dentro del CompanyProvider (ej: sign-in)
 */
export function ApiClientInitializer({ children }: { children: React.ReactNode }) {
  const context = useContext(CompanyContext);

  useEffect(() => {
    if (context) {
      // Configurar el getter de empresa en el apiClient si el contexto está disponible
      apiClient.setCompanyIdGetter(() => context.selectedCompany);
      console.log(`✅ [ApiClientInitializer] API Client actualizado para empresa: ${context.selectedCompany}`, {
        timestamp: new Date().toISOString(),
        availableCompanies: context.companies.map(c => c.id),
      });
    } else {
      // Fallback a empresa por defecto
      apiClient.setCompanyIdGetter(() => 'egl');
      console.log(`⚠️ [ApiClientInitializer] Contexto no disponible, usando empresa por defecto: egl`);
    }
  }, [context?.selectedCompany]); // ← CAMBIO: Monitorear solo selectedCompany

  return <>{children}</>;
}
