import { type LucideIcon } from "lucide-react";

import {
  IconHome,
  HangerIcon,
  IconPackages,
  IconUserCog,
} from "../components/icons";

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { title: "Inicio", url: "/dashboard", icon: IconHome },
  { title: "Pantalones", url: "/pantalones", icon: HangerIcon },
  { title: "Insumos", url: "/insumos", icon: IconPackages },
  { title: "Mano de Obra", url: "/manoObra", icon: IconUserCog },
  // { title: "Usuarios", url: "/usuarios", icon: IconUserCog },
] as const;
