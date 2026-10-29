# Vireo — Coming Soon

Página "Coming Soon" de Vireo S.A.S. en Next.js (App Router, TypeScript).
Equivalente a la versión HTML/CSS/JS original: EN/IT/ES, cuenta regresiva al
1 de enero de 2027 (hora de Colombia) y formulario de contacto vía Web3Forms.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # y completa NEXT_PUBLIC_WEB3FORMS_KEY
npm run dev
```

## Despliegue

Vercel: importar el repositorio, añadir la variable `NEXT_PUBLIC_WEB3FORMS_KEY`
en Settings > Environment Variables y desplegar.

## Estructura

- `app/coming-soon.tsx` — interfaz, idioma, cuenta regresiva y formulario
- `app/copy.ts` — textos en los tres idiomas
- `app/globals.css` — estilos (paleta Vireo)
- `app/fonts/` — Open Sauce Sans (licencia OFL)
