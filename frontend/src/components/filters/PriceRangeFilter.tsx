"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { memo } from "react";

interface PriceRangeFilterProps {
  min: string;
  max: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  minLabel?: string;
  maxLabel?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}

export const PriceRangeFilter = memo(function PriceRangeFilter({
  min,
  max,
  onMinChange,
  onMaxChange,
  minLabel = "Precio Mínimo",
  maxLabel = "Precio Máximo",
  minPlaceholder = "0.00",
  maxPlaceholder = "999.99",
}: PriceRangeFilterProps) {
  return (
    <>
      {/* Filtro de Precio Mínimo */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Label
            htmlFor="precio-min"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {minLabel}
          </Label>
        </div>
        <div className="relative">
          <Input
            id="precio-min"
            type="number"
            step="1"
            placeholder={minPlaceholder}
            value={min}
            onChange={(e) => onMinChange(e.target.value)}
            className="pl-8 border-slate-200 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-700"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
            $
          </span>
        </div>
      </div>

      {/* Filtro de Precio Máximo */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Label
            htmlFor="precio-max"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {maxLabel}
          </Label>
        </div>
        <div className="relative">
          <Input
            id="precio-max"
            type="number"
            step="1"
            placeholder={maxPlaceholder}
            value={max}
            onChange={(e) => onMaxChange(e.target.value)}
            className="pl-8 border-slate-200 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-700"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
            $
          </span>
        </div>
      </div>
    </>
  );
});
