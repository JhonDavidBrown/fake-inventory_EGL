import * as React from "react";
import { cn } from "@/lib/utils";

// Memoized base styles to prevent recreation on every render
const baseInputStyles = [
  // Base styles with always visible border
  "flex h-12 w-full min-w-0 rounded-lg border-2 bg-white px-4 py-3 text-base transition-all duration-200 outline-none",
  "border-slate-300 text-slate-900 shadow-sm",
  // Placeholder and selection
  "placeholder:text-slate-500 selection:bg-primary selection:text-primary-foreground",
  // Focus states
  "focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-0",
  // Hover states
  "hover:border-slate-400",
  // Dark mode
  "dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400",
  "dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-900/20",
  "dark:hover:border-slate-500",
  // File input states
  "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  // Disabled states
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  // Error/validation states
  "aria-invalid:border-red-500 aria-invalid:focus-visible:border-red-500 aria-invalid:focus-visible:ring-red-200",
  "dark:aria-invalid:border-red-400 dark:aria-invalid:focus-visible:ring-red-900/20",
].join(" ");

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(baseInputStyles, className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };

