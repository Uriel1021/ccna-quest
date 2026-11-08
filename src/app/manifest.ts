import type { MetadataRoute } from "next";
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CCNA Quest — Aprende redes jugando",
    short_name: "CCNA Quest",
    description: "Lecciones sencillas, minijuegos y simuladores de examen del CCNA 1 (ITN). Funciona sin conexión.",
    lang: "es-MX",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    prefer_related_applications: false,
    orientation: "portrait",
    background_color: "#f2f2f7",
    theme_color: "#f2f2f7",
    categories: ["education"],
    shortcuts: [
      { name: "Aprender", short_name: "Aprender", url: "/aprender", icons: [{ src: "/icons/192", sizes: "192x192" }] },
      { name: "Juegos", short_name: "Juegos", url: "/juegos", icons: [{ src: "/icons/192", sizes: "192x192" }] },
      { name: "Exámenes", short_name: "Exámenes", url: "/examenes", icons: [{ src: "/icons/192", sizes: "192x192" }] },
    ],
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
