'use client';

import { useCompany } from '@/context/CompanyContext';

interface CompanyBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function CompanyBadge({
  size = 'md',
  showLabel = true,
  className = ''
}: CompanyBadgeProps) {
  const { selectedCompany, companies } = useCompany();

  const selectedCompanyName = companies.find(c => c.id === selectedCompany)?.name || selectedCompany;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(selectedCompanyName);

  // Colores para cada empresa
  const colors: Record<string, { badge: string; border: string }> = {
    egl: {
      badge: 'bg-blue-600 text-white',
      border: 'border-blue-500'
    },
    empresa2: {
      badge: 'bg-amber-600 text-white',
      border: 'border-amber-500'
    },
  };

  const companyColor = colors[selectedCompany] || colors.egl;

  // Tamaños
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-md ${companyColor.badge} flex items-center justify-center font-bold border-2 ${companyColor.border} shadow-sm`}>
        {initials}
      </div>
      {showLabel && (
        <span className="font-semibold text-sm">{selectedCompanyName}</span>
      )}
    </div>
  );
}
