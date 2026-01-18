import type { Table } from "@tanstack/react-table";

export interface FilterValue {
  column: string;
  value: unknown;
}

export interface PriceInputsRef {
  clear: () => void;
}

export interface BaseFiltersProps {
  table: Table<any>;
  onFiltersChange: (filters: FilterValue[]) => void;
}
