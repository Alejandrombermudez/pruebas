import type { Metadata, Viewport } from "next";
import { openSauce } from "../fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vireo | Coming Soon",
  description: "Something new is taking shape. Vireo S.A.S. — smart by nature.",
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
