'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompanyContextType {
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  companies: { id: string; name: string }[];
}

export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const AVAILABLE_COMPANIES = [
  { id: 'egl', name: 'EGL' },
  { id: 'empresa2', name: 'Brooklyn' },
];

const STORAGE_KEY = 'selectedCompany';

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCompany, setSelectedCompanyState] = useState('egl');
  const [mounted, setMounted] = useState(false);

  // Cargar empresa seleccionada del localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && AVAILABLE_COMPANIES.some(c => c.id === stored)) {
      setSelectedCompanyState(stored);
    }
    setMounted(true);
  }, []);

  const setSelectedCompany = (company: string) => {
    // Validar que la empresa existe
    if (AVAILABLE_COMPANIES.some(c => c.id === company)) {
      console.log(`🔄 [CompanyContext] Cambiando empresa a: ${company}`, {
        previousCompany: selectedCompany,
        timestamp: new Date().toISOString(),
        stackTrace: new Error().stack,
      });
      setSelectedCompanyState(company);
      localStorage.setItem(STORAGE_KEY, company);
    } else {
      console.warn(`❌ [CompanyContext] Intento de cambiar a empresa inválida: ${company}`);
    }
  };

  // No renderizar hasta que esté montado en el cliente
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        setSelectedCompany,
        companies: AVAILABLE_COMPANIES,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);

  // Return default values if context is not available (e.g., during SSR)
  if (context === undefined) {
    return {
      selectedCompany: 'egl',
      setSelectedCompany: () => {},
      companies: [
        { id: 'egl', name: 'EGL' },
        { id: 'empresa2', name: 'Brooklyn' },
      ],
    };
  }

  return context;
}
