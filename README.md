# Sistema de Pedidos

App móvil (PWA) para tomar pedidos en una tienda y generar el texto del pedido listo para enviar por WhatsApp — funciona sin conexión y se instala en el móvil como una app nativa.

> Nació de una necesidad muy concreta: cada semana había que escribir a mano el pedido para cada proveedor, producto por producto. Esta app guarda el catálogo, permite marcar cantidades con dos toques y devuelve el pedido ya formateado para copiar y pegar.

## Funcionalidades

- **Catálogo por categorías y subgrupos** — pestañas por categoría (Tabaco, Frutas...), buscador tolerante a mayúsculas/acentos y filtro «solo productos pedidos».
- **Cantidades rápidas** — botones `+` / `−` por producto, edición directa del número y longitud de paso configurable; cada producto puede mostrar u ocultar su unidad (caja, kg, bolsa, cartón...).
- **Plantillas por proveedor** — cada proveedor define su formato de salida con variables `{cantidad}`, `{nombre}`, `{unidad}`, `{unidad_plural}`, `{notas}`, `{n}`, `{fecha}`, `{tienda}`, además de bloques condicionales `[[...]]` que solo aparecen si el valor existe.
- **Extracción del pedido** — genera el texto final por proveedor, con cabecera, líneas, títulos de subgrupo y pie; un botón lo copia al portapapeles.
- **Pegado masivo** — pega una lista de productos (uno por línea) y se añaden a la categoría elegida.
- **Panel de gestión** — alta/edición de productos (nombre, subgrupo, unidad, notas), categorías, subgrupos y plantillas.
- **Orden de productos** — en Gestión › Productos la lista está agrupada igual que la pantalla principal (sin subgrupo, luego cada subgrupo); se reordena arrastrando el asa ≡ (funciona en el móvil), con ↑/↓ o con «Ordenar A→Z». El mismo orden se usa en la lista y en el texto del pedido. Categorías y subgrupos también se reordenan.
- **Copia de seguridad** — Opciones › Copia de seguridad: descargar/compartir un JSON y restaurarlo (archivo o texto pegado).
- **Pensado para el móvil** — mantener pulsado +/− repite, empezar a desplazar sobre un botón no cuenta como pulsación, «Poner a 0» se puede deshacer, el botón atrás de Android cierra Gestión o el pedido en vez de salir, y «Compartir» abre WhatsApp directamente.
- **Persistencia y offline** — el estado se guarda en `localStorage` (Zustand `persist`) y la app funciona sin red gracias al service worker (PWA).

## Stack

| Capa | Herramienta |
| --- | --- |
| UI | React 19 + TypeScript |
| Build | Vite 8 + `vite-plugin-pwa` |
| Estilos | Tailwind CSS 3 |
| Estado | Zustand (con middleware `persist`) |
| Iconos / DnD | lucide-react, @dnd-kit |
| Tests | Vitest |
| Lint | Oxlint |

## Empezar

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # compila a dist/ (incluye service worker)
npm run preview  # sirve la build de producción
npm test         # tests unitarios
npm run lint     # oxlint
```

## Despliegue

La app está en Netlify. Para que cada `git push` a `main` se publique solo:

1. Netlify → tu sitio → **Site configuration → Build & deploy → Continuous deployment → Link repository**.
2. Elige GitHub → `weijzzz/sistema-pedidos`, rama `main`. El comando (`npm run build`), la carpeta (`dist`) y la versión de Node ya vienen en `netlify.toml`.

Mantener **el mismo sitio de Netlify** conserva los datos de los móviles que ya usan la app: el navegador guarda los datos por dirección web, y la nueva versión los actualiza en el sitio (migración de versión 3 → 4: solo renumera el orden, no toca cantidades ni nombres).

Alternativa manual: `npm run build` y arrastra `dist/` a la pestaña *Deploys* del mismo sitio.

## Estructura

```
src/
├── components/   # lista de productos, filas, barras, modal de extracción
├── pages/        # gestión: productos, categorías, pegado masivo, plantillas
├── lib/          # generador de pedidos, plantillas, orden, copias de seguridad
├── store/        # estado global (Zustand + persistencia)
├── data/         # catálogo semilla de ejemplo
├── types/        # modelo de datos
└── utils/        # normalización de texto, long-press
```

---

## English summary

Mobile-first PWA for a small shop to take weekly supplier orders. Products are organised by categories/subgroups with quick quantity steppers; each supplier has a text template (`{cantidad}`, `{unidad}`, conditional `[[...]]` blocks) that renders a WhatsApp-ready order message, copied with one tap. Data persists in `localStorage`, the app works offline and installs to the home screen. Built with React 19, TypeScript, Vite 8, Tailwind 3, Zustand and Vitest.
