/**
 * Wenn STATIC_EXPORT=true gesetzt ist, baut Next.js eine vollstatische
 * Auslieferung nach `out/` (für GitHub Pages).
 * Ohne diese Variable läuft alles wie gewohnt mit SSR / Server Components,
 * inklusive späterer API-Routen.
 *
 * NEXT_PUBLIC_BASE_PATH wird im Workflow auf `/<repo-name>` gesetzt, damit
 * alle Asset- und Routing-URLs unter `https://<user>.github.io/<repo>/`
 * funktionieren.
 */
const useStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(useStaticExport && {
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
    basePath: basePath || undefined,
    assetPrefix: basePath ? `${basePath}/` : undefined,
  }),
};

export default nextConfig;
