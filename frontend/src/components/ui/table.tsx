"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { semanticColors } from "@/lib/colors";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
      role="region"
      aria-label="Data table"
      tabIndex={0}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        role="table"
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b [&_tr]:border-slate-200 [&_tr]:dark:border-slate-700",
        className
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0 divide-y divide-slate-200 dark:divide-slate-700",
        className
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-slate-50 dark:hover:bg-slate-800/50 data-[state=selected]:bg-slate-100 dark:data-[state=selected]:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        semanticColors.text.primary,
        "h-12 px-4 text-left align-middle font-semibold text-sm whitespace-nowrap [&:has([role=checkbox])]:w-12 [&:has([role=checkbox])]:px-0 [&:has([role=checkbox])]:text-center",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:w-12 [&:has([role=checkbox])]:px-0 [&:has([role=checkbox])]:text-center",
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(semanticColors.text.muted, "mt-4 text-sm", className)}
      {...props}
    />
  );
}

// Memoized components for better performance with large tables
const MemoizedTableRow = React.memo(TableRow);
const MemoizedTableCell = React.memo(TableCell);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  // Export memoized versions for performance-critical use cases
  MemoizedTableRow,
  MemoizedTableCell,
};
