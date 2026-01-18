"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { semanticColors } from "@/lib/colors";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    className={cn(
      // Base styles
      "peer size-4 shrink-0 rounded-[4px] border-2 shadow-sm transition-all outline-none",
      // Use semantic colors from design system
      semanticColors.input.replace(
        "focus:border-slate-400 focus:ring-slate-400",
        ""
      ),
      // Focus state
      "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
      // Disabled state
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Checked state - using button primary colors for consistency
      "data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700 data-[state=checked]:text-white",
      "dark:data-[state=checked]:bg-slate-600 dark:data-[state=checked]:border-slate-600",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className="flex items-center justify-center text-current"
    >
      <CheckIcon className="size-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
