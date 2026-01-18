import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PantalonDetailPageClient } from "./components/PantalonDetailPageClient";

interface PantalonDetailPageProps {
  params: Promise<{ referencia: string }>;
}

// Constants for better performance
const SKELETON_ITEMS = Array.from({ length: 4 }, (_, i) => i);
const SKELETON_SECTIONS = Array.from({ length: 2 }, (_, i) => i);
const SKELETON_SUBSECTIONS = Array.from({ length: 3 }, (_, i) => i);

export async function generateMetadata({
  params,
}: PantalonDetailPageProps): Promise<Metadata> {
  const { referencia } = await params;

  return {
    title: `Pantalón ${referencia} | EGL`,
    description: `Detalles del pantalón con referencia ${referencia} - Sistema de Inventario EGL`,
    keywords: ["pantalón", "detalle", "inventario", "EGL", referencia],
  };
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header skeleton */}
      <div className="border rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-64 animate-pulse" />
            <div className="h-4 bg-muted rounded w-48 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded w-20 animate-pulse" />
            <div className="h-10 bg-muted rounded w-20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-48 animate-pulse" />
          <div className="aspect-[4/3] bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          </div>
        </div>
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-48 animate-pulse" />
          <div className="space-y-3">
            {SKELETON_ITEMS.map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Additional sections skeleton */}
      {SKELETON_SECTIONS.map((i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
          <div className="space-y-3">
            {SKELETON_SUBSECTIONS.map((j) => (
              <div key={j} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function PantalonDetailPage({
  params,
}: PantalonDetailPageProps) {
  const { userId } = await auth();
  const { referencia } = await params;

  // Use redirect for better UX instead of rendering error states
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PantalonDetailPageClient referencia={referencia} />
    </Suspense>
  );
}
