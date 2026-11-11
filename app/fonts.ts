import localFont from "next/font/local";

// Fuente compartida por el Coming Soon y el sitio completo.
export const openSauce = localFont({
  src: [
    { path: "./fonts/open-sauce-sans-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/open-sauce-sans-600.ttf", weight: "600", style: "normal" },
  ],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});
