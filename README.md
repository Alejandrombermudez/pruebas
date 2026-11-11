# Vireo — sitio web

Sitio de Vireo S.A.S. en Next.js (App Router, TypeScript). Equivalente a la versión
HTML/CSS/JS `Vireo_Website_071126`: Home, Servicios, About, Experiencia y Contacto,
en EN/IT/ES, con logo animado en partículas y formulario vía Web3Forms.

Rutas:

- `/` — página "Coming Soon" (cuenta regresiva al 1 de enero de 2027).
- `/preview` — el sitio completo. No tiene enlace desde `/` y lleva `noindex`: solo
  se accede conociendo la ruta.

En `/preview`, en escritorio cada gesto de rueda o touchpad lleva a la sección siguiente
(`useSectionWheel` en `motion.ts`, más `scroll-snap` en CSS), con puntos de navegación a la
derecha. Las animaciones de entrada usan `[data-reveal]` y se desactivan con "reducir movimiento".

Cada ruta tiene su propio layout raíz (`app/(coming-soon)` y `app/(site)`), así que sus
estilos no se mezclan; navegar entre ellas recarga la página.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # y completa NEXT_PUBLIC_WEB3FORMS_KEY
npm run dev
```

## Despliegue

Vercel: importar el repositorio y añadir `NEXT_PUBLIC_WEB3FORMS_KEY` en
Settings > Environment Variables. Cada rama genera su propia vista previa; la rama de
producción (normalmente `main`) es la que sirve el dominio.

## Estructura

- `app/(coming-soon)/` — página Coming Soon (componente, textos y estilos)
- `app/(site)/preview/site.tsx` — cabecera, menú, idioma, secciones y pie
- `app/(site)/preview/sections.tsx` — Servicios, About (contadores) y Experiencia
- `app/(site)/preview/contact-form.tsx` — formulario de contacto y botón de WhatsApp
- `app/(site)/preview/hero-animation.tsx` + `hero-points.ts` — logo animado en canvas
- `app/(site)/preview/copy.ts` — textos del sitio en los tres idiomas
- `app/(site)/globals.css` — estilos del sitio (paleta Vireo)
- `app/fonts.ts` y `app/fonts/` — Open Sauce Sans (licencia OFL)
