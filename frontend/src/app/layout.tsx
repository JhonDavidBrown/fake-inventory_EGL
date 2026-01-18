import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";

import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CompanyProvider } from "@/context/CompanyContext";
import { CompanyThemeProvider } from "@/components/ThemeProvider";
import { ApiClientInitializer } from "@/components/ApiClientInitializer";
import { clerkAppearance } from "@/config/clerk-theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Improve font loading performance
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Improve font loading performance
});

export const metadata = {
  title: "Sistema de Inventario EGL",
  description: "Sistema de gestión de inventario para confección de pantalones",

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      localization={esES}
      appearance={clerkAppearance}
    >
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <CompanyProvider>
              <CompanyThemeProvider />
              <ApiClientInitializer>
                {children}
                <Toaster richColors position="top-right" expand={true} />
              </ApiClientInitializer>
            </CompanyProvider>
          </ThemeProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}
