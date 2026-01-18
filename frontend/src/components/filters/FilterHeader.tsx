"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import { memo } from "react";

interface FilterHeaderProps {
  title: string;
  activeFilters: number;
  onClearAll: () => void;
}

export const FilterHeader = memo(function FilterHeader({
  title,
  activeFilters,
  onClearAll,
}: FilterHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </CardTitle>
        {activeFilters > 0 && (
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {activeFilters} activo{activeFilters > 1 ? "s" : ""}
          </Badge>
        )}
      </div>
      {activeFilters > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar todo
        </Button>
      )}
    </div>
  );
});
