import path from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for optimized Docker builds
  output: "standalone",
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  images: {
    // Enable optimized image processing with modern formats
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.clicicor.online",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "inventario-pantalones-img.s3.us-east-005.backblazeb2.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lmcndepbopshuqxdukhd.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
    },
    ],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // Improve build performance (swcMinify is now default in Next.js 15)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;

