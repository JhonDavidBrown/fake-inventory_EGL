"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment, useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: "Inicio",
  lotes: "Lotes",
  pantalones: "Pantalones",
  insumos: "Insumos",
  manoObra: "Mano de Obra",
  usuarios: "Usuarios",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];

    // Siempre incluir Home
    breadcrumbItems.push({ label: "Inicio", href: "/dashboard" });

    // Construir breadcrumbs para cada segmento
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment;

      // Si es el último segmento, no incluir href (página actual)
      if (index === segments.length - 1) {
        breadcrumbItems.push({ label });
      } else {
        breadcrumbItems.push({ label, href: currentPath });
      }
    });

    return breadcrumbItems;
  }, [pathname]);

  // No mostrar breadcrumbs si solo hay un elemento (Home)
  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400 mb-6"
    >
      <Home className="h-4 w-4" />
      {breadcrumbs.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-slate-200 font-medium">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
