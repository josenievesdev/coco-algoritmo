# Coco Algoritmo

Prototipo jugable de un videojuego móvil/web para entrenar lógica y
algoritmos ordenando bloques visuales.

## Ejecutar

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` en el navegador.

## Comandos

```bash
npm run lint
npm run build
```

`npm run build` genera el sitio estático en `out/`.

## Despliegue en Cloudflare Pages

El proyecto usa Next.js Static Export (`output: "export"`) y se publica
como sitio estático en Cloudflare Pages:

- Tipo de proyecto: Pages.
- Rama de producción: `master`.
- Framework preset: `Next.js (Static HTML Export)`.
- Comando de compilación: `npm run build`.
- Directorio de salida: `out`.
- Directorio raíz: vacío.

## Estructura

- `src/app`: rutas y configuración de la aplicación Next.js.
- `src/componentes`: piezas visuales de la experiencia de juego.
- `src/juegos`: definiciones y estado de los retos.
- `src/motor`: comparación de secuencias y efectos de juego.
- `src/datos`: catálogo de juegos disponibles.
- `src/recursos`: espacio para sonidos e imágenes.
- `src/tipos`: interfaces compartidas.

El primer reto es `src/juegos/cafe.ts`. La secuencia se detecta de forma
automática al terminar cada movimiento; no existe un botón de comprobación.

El manifiesto y el trabajador de servicio de la PWA viven en `public/`.
