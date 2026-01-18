'use client';

import { useEffect } from 'react';
import { useCompany } from '@/context/CompanyContext';

// Definición de colores para cada empresa
const companyThemes = {
  egl: {
    // Azul para EGL
    light: {
      primary: 'oklch(0.525 0.172 251.095)', // blue-600
      primaryForeground: 'oklch(0.985 0 0)',
      secondaryForeground: 'oklch(0.525 0.172 251.095)',
      accentForeground: 'oklch(0.525 0.172 251.095)',
      sidebarPrimary: 'oklch(0.525 0.172 251.095)',
      sidebarAccentForeground: 'oklch(0.525 0.172 251.095)',
      // Naranja para botones líquidos
      liquidButtonColor: 'oklch(0.645 0.246 16.439)', // orange-600
      liquidButtonBackground: 'oklch(0.769 0.188 70.08)', // orange-200
    },
    dark: {
      primary: 'oklch(0.625 0.184 252.546)', // blue-400
      primaryForeground: 'oklch(0.985 0 0)',
      secondaryForeground: 'oklch(0.625 0.184 252.546)',
      accentForeground: 'oklch(0.625 0.184 252.546)',
      sidebarPrimary: 'oklch(0.625 0.184 252.546)',
      sidebarAccentForeground: 'oklch(0.625 0.184 252.546)',
      // Naranja para botones líquidos en dark mode
      liquidButtonColor: 'oklch(0.769 0.188 70.08)', // orange-400
      liquidButtonBackground: 'oklch(0.645 0.246 16.439)', // orange-900
    }
  },
  empresa2: {
    // Amber/Amarillo para Brooklyn
    light: {
      primary: 'oklch(0.565 0.191 68.219)', // amber-600
      primaryForeground: 'oklch(0.985 0 0)',
      secondaryForeground: 'oklch(0.565 0.191 68.219)',
      accentForeground: 'oklch(0.565 0.191 68.219)',
      sidebarPrimary: 'oklch(0.565 0.191 68.219)',
      sidebarAccentForeground: 'oklch(0.565 0.191 68.219)',
      // Verde para botones líquidos
      liquidButtonColor: 'oklch(0.496 0.175 152.284)', // green-600
      liquidButtonBackground: 'oklch(0.783 0.138 151.711)', // green-200
    },
    dark: {
      primary: 'oklch(0.733 0.197 74.944)', // amber-400
      primaryForeground: 'oklch(0.145 0 0)',
      secondaryForeground: 'oklch(0.733 0.197 74.944)',
      accentForeground: 'oklch(0.733 0.197 74.944)',
      sidebarPrimary: 'oklch(0.733 0.197 74.944)',
      sidebarAccentForeground: 'oklch(0.733 0.197 74.944)',
      // Verde para botones líquidos en dark mode
      liquidButtonColor: 'oklch(0.664 0.168 152.637)', // green-400
      liquidButtonBackground: 'oklch(0.337 0.094 152.658)', // green-900
    }
  }
};

export function CompanyThemeProvider() {
  const { selectedCompany } = useCompany();

  useEffect(() => {
    const theme = companyThemes[selectedCompany as keyof typeof companyThemes] || companyThemes.egl;
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    const colors = isDark ? theme.dark : theme.light;

    // Aplicar colores principales
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);

    if (colors.secondaryForeground) {
      root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
    }
    if (colors.accentForeground) {
      root.style.setProperty('--accent-foreground', colors.accentForeground);
    }
    if (colors.sidebarPrimary) {
      root.style.setProperty('--sidebar-primary', colors.sidebarPrimary);
    }
    if (colors.sidebarAccentForeground) {
      root.style.setProperty('--sidebar-accent-foreground', colors.sidebarAccentForeground);
    }

    // Aplicar colores de botón líquido
    root.style.setProperty('--liquid-button-color', colors.liquidButtonColor);
    root.style.setProperty('--liquid-button-background-color', colors.liquidButtonBackground);

    console.log(`🎨 [ThemeProvider] Tema aplicado para ${selectedCompany}:`, {
      mode: isDark ? 'dark' : 'light',
      primary: colors.primary,
      liquidColor: colors.liquidButtonColor,
    });
  }, [selectedCompany]);

  // Observar cambios en el tema oscuro/claro
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = companyThemes[selectedCompany as keyof typeof companyThemes] || companyThemes.egl;
      const root = document.documentElement;
      const isDark = root.classList.contains('dark');

      const colors = isDark ? theme.dark : theme.light;

      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--primary-foreground', colors.primaryForeground);

      if (colors.secondaryForeground) {
        root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
      }
      if (colors.accentForeground) {
        root.style.setProperty('--accent-foreground', colors.accentForeground);
      }
      if (colors.sidebarPrimary) {
        root.style.setProperty('--sidebar-primary', colors.sidebarPrimary);
      }
      if (colors.sidebarAccentForeground) {
        root.style.setProperty('--sidebar-accent-foreground', colors.sidebarAccentForeground);
      }

      root.style.setProperty('--liquid-button-color', colors.liquidButtonColor);
      root.style.setProperty('--liquid-button-background-color', colors.liquidButtonBackground);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [selectedCompany]);

  return null;
}
