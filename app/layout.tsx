import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const openSauce = localFont({
  src: [
    { path: "./fonts/open-sauce-sans-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/open-sauce-sans-600.ttf", weight: "600", style: "normal" },
  ],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Vireo | smart by nature",
  description:
    "Industrial automation, commissioning, robotics and smart manufacturing. Vireo — smart by nature.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06183F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={openSauce.className}>
      <body>{children}</body>
    </html>
  );
}
