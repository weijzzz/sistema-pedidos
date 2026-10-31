# Sistema de Pedidos

App móvil (PWA) para tomar pedidos en una tienda y generar el texto del pedido listo para enviar por WhatsApp — funciona sin conexión y se instala en el móvil como una app nativa.

> Nació de una necesidad muy concreta: cada semana había que escribir a mano el pedido para cada proveedor, producto por producto. Esta app guarda el catálogo, permite marcar cantidades con dos toques y devuelve el pedido ya formateado para copiar y pegar.

## Funcionalidades

- **Catálogo por categorías y subgrupos** — pestañas por categoría (Tabaco, Frutas...), buscador tolerante a mayúsculas/acentos y filtro «solo productos pedidos».
- **Cantidades rápidas** — botones `+` / `−` por producto, edición directa del número y longitud de paso configurable; cada producto puede mostrar u ocultar su unidad (caja, kg, bolsa, cartón...).
- **Plantillas por proveedor** — cada proveedor define su formato de salida con variables `{cantidad}`, `{nombre}`, `{unidad}`, `{unidad_plural}`, `{notas}`, `{n}`, `{fecha}`, `{tienda}`, además de bloques condicionales `[[...]]` que solo aparecen si el valor existe.
- **Extracción del pedido** — genera el texto final por proveedor, con cabecera, líneas, títulos de subgrupo y pie; un botón lo copia al portapapeles.
- **Pegado masivo** — pega una lista de productos (uno por línea) y se añaden a la categoría elegida.
- **Panel de gestión** — alta/edición de productos, categorías, subgrupos y plantillas, con reordenación arrastrando.
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

Cualquier hosting estático sirve. La ruta recomendada es Netlify:

1. `npm run build`
2. Arrastra la carpeta `dist/` a [Netlify Drop](https://app.netlify.com/drop), o conecta el repo y usa `dist` como *publish directory*.
3. Abre la URL en el móvil → «Añadir a pantalla de inicio» para instalarla como PWA.

## Estructura

```
src/
├── components/   # lista de productos, filas, barras, modal de extracción
├── pages/        # gestión: productos, categorías, pegado masivo, plantillas
├── lib/          # generador de pedidos, motor de plantillas, plurales
├── store/        # estado global (Zustand + persistencia)
├── data/         # catálogo semilla de ejemplo
├── types/        # modelo de datos
└── utils/        # normalización de texto, long-press
```

---

## English summary

Mobile-first PWA for a small shop to take weekly supplier orders. Products are organised by categories/subgroups with quick quantity steppers; each supplier has a text template (`{cantidad}`, `{unidad}`, conditional `[[...]]` blocks) that renders a WhatsApp-ready order message, copied with one tap. Data persists in `localStorage`, the app works offline and installs to the home screen. Built with React 19, TypeScript, Vite 8, Tailwind 3, Zustand and Vitest.
