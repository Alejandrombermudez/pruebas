import type { Metadata, Viewport } from "next";
import { openSauce } from "../fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vireo | smart by nature",
  description:
    "Industrial automation, commissioning, robotics and smart manufacturing. Vireo — smart by nature.",
  // Vista previa privada: sin enlace desde el Coming Soon y fuera de los buscadores.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06183F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={openSauce.className}>
      <body>{children}</body>
    </html>
  );
}
