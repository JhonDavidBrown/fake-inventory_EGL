'use client';

import { useCompany } from '@/context/CompanyContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export function CompanySelectorHeader() {
  const { selectedCompany, setSelectedCompany, companies } = useCompany();

  const handleCompanyChange = (companyId: string) => {
    console.log(`👆 [CompanySelectorHeader] Usuario hace clic para cambiar empresa`, {
      from: selectedCompany,
      to: companyId,
      timestamp: new Date().toISOString(),
    });
    setSelectedCompany(companyId);
  };

  // Obtener el nombre de la empresa seleccionada
  const selectedCompanyName = companies.find(c => c.id === selectedCompany)?.name || selectedCompany;

  // Obtener iniciales de la empresa
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const selectedCompanyInitials = getInitials(selectedCompanyName);

  // Colores para cada empresa
  const colors: Record<string, string> = {
    egl: 'bg-blue-600 text-white',
    empresa2: 'bg-amber-600 text-white',
  };

  const badgeColor = colors[selectedCompany] || 'bg-blue-600 text-white';

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent/30 text-sm transition-colors relative z-10">
          <div className={`h-6 w-6 rounded-md ${badgeColor} flex items-center justify-center text-xs font-bold shrink-0`}>
            {selectedCompanyInitials}
          </div>
          <span className="font-medium text-sm hidden sm:inline">{selectedCompanyName}</span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 z-[9999]" 
        sideOffset={5}
        avoidCollisions={true}
        sticky="always"
      >
        {companies.map((company) => {
          const isSelected = selectedCompany === company.id;
          const companyColor = colors[company.id] || 'bg-gray-600';
          return (
            <DropdownMenuItem
              key={company.id}
              onClick={() => handleCompanyChange(company.id)}
              className={`cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
            >
              <span className={`inline-block h-3 w-3 rounded-sm ${companyColor} mr-2`}></span>
              {company.name}
              {isSelected && <span className="ml-auto text-xs">✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
