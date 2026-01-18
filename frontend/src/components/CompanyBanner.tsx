'use client';

import { useCompany } from '@/context/CompanyContext';
import { AlertCircle } from 'lucide-react';

interface CompanyBannerProps {
  showAlways?: boolean;
}

export function CompanyBanner({ showAlways = false }: CompanyBannerProps) {
  const { selectedCompany, companies } = useCompany();

  const selectedCompanyName = companies.find(c => c.id === selectedCompany)?.name || selectedCompany;

  // Mostrar banner si showAlways es true, o si no es EGL
  // Para que siempre se muestre en páginas principales, pasa showAlways={true}

  // Colores para cada empresa
  const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    egl: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    empresa2: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-900 dark:text-amber-100',
      icon: 'text-amber-600 dark:text-amber-400'
    },
  };

  const companyColor = colors[selectedCompany] || colors.egl;

  return (
    <div className={`${companyColor.bg} border ${companyColor.border} rounded-md p-3 mb-4 flex items-center gap-2`}>
      <AlertCircle className={`h-5 w-5 shrink-0 ${companyColor.icon}`} />
      <span className={`text-sm font-semibold ${companyColor.text}`}>
        Estás trabajando en: <strong>{selectedCompanyName}</strong>
      </span>
    </div>
  );
}
