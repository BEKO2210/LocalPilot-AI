/**
 * Wenn STATIC_EXPORT=true gesetzt ist, baut Next.js eine vollstatische
 * Auslieferung nach `out/` (für GitHub Pages).
 * Ohne diese Variable läuft alles wie gewohnt mit SSR / Server Components,
 * inklusive der API-Route `app/api/ai/generate/route.ts`.
 *
 * NEXT_PUBLIC_BASE_PATH wird im Workflow auf `/<repo-name>` gesetzt, damit
 * alle Asset- und Routing-URLs unter `https://<user>.github.io/<repo>/`
 * funktionieren.
 *
 * **API-Routen-Trick**: Static-Export unterstützt keine dynamischen
 * (POST) Routen. Wir lösen das, indem wir `pageExtensions` im
 * Static-Export-Build auf `.tsx` einschränken. `route.ts` wird dann
 * nicht als Route erkannt und der Build bleibt grün. Im SSR-Build
 * (Vercel etc.) sind alle Extensions aktiv und die Route ist
 * adressierbar. Alle Pages/Layouts in `src/app/` sind ohnehin `.tsx`,
 * deshalb verlieren wir keine Routen.
 */
const useStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: useStaticExport
    ? ["tsx", "jsx"]
    : ["tsx", "ts", "jsx", "js"],
  ...(useStaticExport && {
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
    basePath: basePath || undefined,
    assetPrefix: basePath ? `${basePath}/` : undefined,
  }),
};

export default nextConfig;
