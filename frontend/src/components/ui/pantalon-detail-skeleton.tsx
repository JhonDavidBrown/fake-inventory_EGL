import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PantalonDetailSkeletonProps {
  onBack: () => void;
}

export function PantalonDetailSkeleton({
  onBack,
}: PantalonDetailSkeletonProps) {
  return (
    <div className="container mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      {/* Loading skeleton */}
      <div className="space-y-6">
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
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
