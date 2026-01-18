"use client";

import { memo } from "react";
import { ThemeToggleSimple } from "@/components/theme-toggle";

interface SidebarThemeToggleProps {
  isCollapsed: boolean;
}

export const SidebarThemeToggle = memo(function SidebarThemeToggle({
  isCollapsed,
}: SidebarThemeToggleProps) {
  return (
    <div className="px-2">
      <div
        className={`flex items-center gap-2 py-2 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Tema
          </span>
        )}
        <ThemeToggleSimple />
      </div>
    </div>
  );
});
