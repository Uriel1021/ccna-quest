import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";

/* En dispositivos Apple se usa San Francisco (fuente del sistema); Inter es el respaldo más parecido. */
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "CCNA Quest", template: "%s · CCNA Quest" },
  description: "Aprende redes (CCNA ITN) jugando: lecciones sencillas, minijuegos y simuladores de examen que funcionan sin conexión.",
  applicationName: "CCNA Quest",
  appleWebApp: { capable: true, title: "CCNA Quest", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body className={inter.variable}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
