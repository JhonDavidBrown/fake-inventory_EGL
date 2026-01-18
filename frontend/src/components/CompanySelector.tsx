'use client';

import { useCompany } from '@/context/CompanyContext';
import { useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export function CompanySelector() {
  const { selectedCompany, setSelectedCompany, companies } = useCompany();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleCompanyChange = (companyId: string) => {
    console.log(`👆 [CompanySelector] Usuario hace clic para cambiar empresa`, {
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

  // Colores para cada empresa - más acordes al sidebar
  const colors: Record<string, string> = {
    egl: 'bg-blue-600 text-white',
    empresa2: 'bg-amber-600 text-white',
  };

  const badgeColor = colors[selectedCompany] || 'bg-blue-600 text-white';

  // Versión colapsada - muy simple y minimalista
  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`${badgeColor} h-8 w-8 rounded-md font-semibold text-xs flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer mx-auto mb-2`}>
            {selectedCompanyInitials}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-48">
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

  // Versión expandida - limpia y simple
  return (
    <div className="px-2 py-2 mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full h-8 px-2 rounded-md border border-input bg-background hover:bg-accent/30 text-xs transition-colors flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className={`h-5 w-5 rounded-sm ${badgeColor} flex items-center justify-center text-xs font-bold shrink-0`}>
                {selectedCompanyInitials}
              </div>
              <span className="truncate font-medium text-xs">{selectedCompanyName}</span>
            </div>
            <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start" className="w-48">
          {companies.map((company) => {
            const isSelected = selectedCompany === company.id;
            const companyColor = colors[company.id] || 'bg-gray-600';
            return (
              <DropdownMenuItem
                key={company.id}
                onClick={() => handleCompanyChange(company.id)}
                className={`cursor-pointer text-xs ${isSelected ? 'bg-accent' : ''}`}
              >
                <span className={`inline-block h-3 w-3 rounded-sm ${companyColor} mr-2`}></span>
                {company.name}
                {isSelected && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
