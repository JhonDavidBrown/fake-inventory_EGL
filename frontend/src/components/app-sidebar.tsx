"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useMemo, useCallback } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS } from "@/lib/navigation";
import { UserProfileModal } from "@/components/user-profile-modal";
import { SidebarThemeToggle } from "@/components/sidebar-theme-toggle";
import { useCompany } from "@/context/CompanyContext";

export function AppSidebar() {
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { state } = useSidebar();
  const { selectedCompany, companies } = useCompany();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenProfileModal(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    setOpenProfileModal(true);
  }, []);

  const items = NAVIGATION_ITEMS;

  const shouldShowText = useMemo(() => {
    return mounted && (state === "expanded" || isMobile);
  }, [mounted, state, isMobile]);

  // Memoize user display name to avoid re-renders
  const userDisplayName = useMemo(() => {
    return user?.fullName || user?.firstName || "Usuario";
  }, [user?.fullName, user?.firstName]);

  const userEmail = useMemo(() => {
    return user?.emailAddresses[0]?.emailAddress;
  }, [user?.emailAddresses]);

  if (!user) return null;

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {/* Badge indicador de empresa (solo visual) */}
          {mounted && (
            <div className="px-2 py-2 mb-2">
              <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${
                state === "collapsed" ? "justify-center" : ""
              }`}>
                <div className={`h-6 w-6 rounded-sm ${
                  selectedCompany === 'egl' ? 'bg-blue-600' : 'bg-amber-600'
                } flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {selectedCompany === 'egl' ? 'EG' : 'BR'}
                </div>
                {state === "expanded" && (
                  <span className="text-xs font-medium">
                    {companies.find(c => c.id === selectedCompany)?.name || selectedCompany}
                  </span>
                )}
              </div>
            </div>
          )}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    {isActive ? (
                      <SidebarMenuButton isActive>
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 shrink-0" />
                          {shouldShowText && (
                            <span className="text-sm">{item.title}</span>
                          )}
                        </div>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          {shouldShowText && (
                            <span className="text-sm">{item.title}</span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-2">
          <SidebarThemeToggle isCollapsed={state === "collapsed"} />

          {/* Separador sutil */}
          <div className="mx-2 h-px bg-neutral-200 dark:bg-neutral-700" />

          {/* Perfil del usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center w-full ${
                  state === "collapsed" ? "justify-center" : "justify-between"
                } gap-2 p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.fullName || "Avatar"}
                    />
                  </Avatar>
                  {state === "expanded" && (
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium leading-tight">
                        {userDisplayName}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {userEmail}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleOpenModal}>
                Configurar cuenta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <SignOutButton>
                <DropdownMenuItem className="text-red-500 focus:text-red-500 dark:text-red-400 dark:focus:text-red-400">
                  Cerrar sesión
                </DropdownMenuItem>
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>

      <UserProfileModal isOpen={openProfileModal} onClose={handleCloseModal} />

    </Sidebar>
  );
}
