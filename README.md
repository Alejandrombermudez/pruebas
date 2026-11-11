# Vireo — sitio web

Sitio de Vireo S.A.S. en Next.js (App Router, TypeScript). Equivalente a la versión
HTML/CSS/JS `Vireo_Website_071126`: Home, Servicios, About, Experiencia y Contacto,
en EN/IT/ES, con logo animado en partículas y formulario vía Web3Forms.

> La página "Coming Soon" (cuenta regresiva al 1 de enero de 2027) sigue en la rama `main`.
> Esta versión vive en la rama `website`.

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

- `app/site.tsx` — cabecera, menú, idioma, secciones y pie
- `app/sections.tsx` — Servicios, About (contadores) y Experiencia
- `app/contact-form.tsx` — formulario de contacto y botón de WhatsApp
- `app/hero-animation.tsx` + `app/hero-points.ts` — logo animado en canvas
- `app/copy.ts` — textos en los tres idiomas
- `app/globals.css` — estilos (paleta Vireo)
- `app/fonts/` — Open Sauce Sans (licencia OFL)
