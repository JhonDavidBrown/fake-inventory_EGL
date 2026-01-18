import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

export const IconHome = forwardRef<SVGSVGElement, LucideProps>(
  ({ className = "w-5 h-5", ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 12l-2 0l9 -9l9 9l-2 0v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -7z" />
      <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
    </svg>
  )
);

IconHome.displayName = "IconHome";
