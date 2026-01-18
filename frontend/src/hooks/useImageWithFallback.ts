import { useState, useEffect, useCallback, useMemo } from "react";

interface UseImageWithFallbackProps {
  src: string;
  fallback: string;
  alt: string;
  enableCacheInvalidation?: boolean;
}

interface UseImageWithFallbackReturn {
  src: string;
  alt: string;
  onError: () => void;
  onLoad: () => void;
  hasError: boolean;
  isLoading: boolean;
}

export function useImageWithFallback({
  src,
  fallback,
  alt,
  enableCacheInvalidation = true,
}: UseImageWithFallbackProps): UseImageWithFallbackReturn {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageAlt, setImageAlt] = useState(alt);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Track client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add cache-busting parameter to Backblaze images (client-side only)
  const cacheBustedSrc = useMemo(() => {
    if (!isClient) {
      return src; // During SSR, return original src
    }
    if (src && src.includes("backblazeb2.com")) {
      const separator = src.includes("?") ? "&" : "?";
      return `${src}${separator}t=${Date.now()}`;
    }
    return src;
  }, [src, isClient]);

  useEffect(() => {
    if (isClient) {
      // Apply cache-busting on client-side after hydration
      setImageSrc(cacheBustedSrc);
      setImageAlt(alt);
      setHasError(false);
      setIsLoading(true);
    }
  }, [cacheBustedSrc, alt, isClient]);

  const handleError = useCallback(() => {
    if (!hasError) {
      console.log(`Image failed to load: ${src}`);
      setImageSrc(fallback);
      setImageAlt(`Imagen no disponible - ${alt}`);
      setHasError(true);
      setIsLoading(false);

      // Try to invalidate Next.js cache
      if (enableCacheInvalidation && typeof window !== "undefined") {
        fetch(`/api/revalidate-image?url=${encodeURIComponent(src)}`).catch(
          (err) => console.log("Cache invalidation failed:", err)
        );
      }
    }
  }, [hasError, src, fallback, alt, enableCacheInvalidation]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    // Image loaded successfully, reset error state if we're back to original src
    if (hasError && imageSrc === src) {
      setHasError(false);
    }
  }, [hasError, imageSrc, src]);

  return {
    src: imageSrc,
    alt: imageAlt,
    onError: handleError,
    onLoad: handleLoad,
    hasError,
    isLoading,
  };
}
