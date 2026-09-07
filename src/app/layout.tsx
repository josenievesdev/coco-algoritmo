import type { Metadata } from "next";
import type { Viewport } from "next";
import RegistrarPwa from "@/componentes/RegistrarPwa";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coco Algoritmo",
  description:
    "Un videojuego de retos de lógica donde cada bloque cuenta.",
  applicationName: "Coco Algoritmo",
  manifest: "/manifiesto.webmanifest",
  icons: {
    icon: "/icono-coco.svg",
    shortcut: "/icono-coco.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#17122f",
};

export default function DisenoPrincipal({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-[#17122f]">
        <RegistrarPwa />
        {children}
      </body>
    </html>
  );
}
