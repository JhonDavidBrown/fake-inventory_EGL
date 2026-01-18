"use client";

import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CompanySelectorHeader } from "@/components/CompanySelectorHeader";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex min-h-screen flex-1 flex-col w-full min-w-0">
  <header className="sticky top-0 z-[100] shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-gray-950/80 shadow-sm">
          <div className="flex items-center justify-between h-14 px-2 md:px-4 relative min-w-0">
            <SidebarTrigger className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-0 shadow-none p-2 rounded-md transition-colors" />
            <div className="relative z-[101] min-w-0">
              <CompanySelectorHeader />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
