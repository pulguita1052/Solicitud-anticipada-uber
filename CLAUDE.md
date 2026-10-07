# Solicitud anticipada Uber

Antes de cualquier tarea de UI, lee y sigue @FIGMA_REPLICA.md.

## Parámetros del proyecto

| Parámetro | Valor |
|---|---|
| URL del archivo Figma | https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/RB_Handheld_Mejoras-de-procesos?node-id=5170-10163 |
| `FILE_KEY` | zZBoCtJor0tdJ91umiqb7l |
| Node inicial | 5170:10163 |
| Plataforma objetivo inicial | Móvil (Handheld) |
| Stack | React 18 + TypeScript + Vite + CSS variables — PWA |
| Librería de componentes externa | Ninguna (todo se construye desde Figma) |
| Páginas de Figma a replicar | 1) `🔎 Revisión - Durante el surtido` (3048:10012) — principal · 2) `⚙️ Configuraciones HH` (5170:10163) |
| Páginas a ignorar | Todas las demás (ver `docs/figma/inventory.md`). La sección `NO TOCAR` de `📲 Surtido - Un pedido x ronda` (24:16) solo se usa como fuente de componentes maestros |
| Tamaño de frame base | 430×932 |
| Tema(s) / modes | Solo claro (colecciones con un único modo) |
| Idioma de la UI | Español (MX) |

## Estado (2026-09-29)

**F0–F7 ejecutados para las 4 páginas del alcance + Solicitud anticipada de Uber (ERB-53024).** Ver `docs/figma/CHANGELOG.md`.

- **Flujo completo funcional**: surtido → revisión → factura → embarque → **Uber** (candidatura, consolidación, formulario, confirmación).
- **Reglas de Uber** en `src/domain/uber.ts` (6 pruebas unitarias pasan, `npm run test:domain`). Documento en `docs/tecnico/uber.md`.
- **11 pantallas verificadas visualmente**: Menú y Configuraciones bajo 1 %; el resto entre 1–5 % (antialiasing del texto en Windows vs Figma, layout coincide).
- **Sistema de diseño**: 8 átomos, 7 moléculas, 7 organismos. Catálogo en `docs/components/INDEX.md`.
- **Tokens**: `src/design-system/tokens/tokens.{json,css}` con 26 colores, 12 estilos de texto, 2 sombras, 7 curvas de animación. Generados desde Figma con `tools/build-tokens.mjs`.
- **Mapa de identidad**: `docs/figma/figma-map.json` (30+ pantallas y 13 componentes).
- **Flujos**: `docs/figma/flujos.md` (extraídos de `node.reactions` reales).

Notas de trabajo con el MCP:
- `use_figma` se usa **solo con scripts de lectura** (listar páginas, resolver maestros, leer estilos, variables y `reactions` del prototipo). Nunca modificar el archivo de Figma.
- Los flujos (F5) se extraen de las interacciones reales del prototipo (`node.reactions`); no se deducen.

## Trabajo en curso: Embarque de traspaso (rama `feature-embarque-de-traspaso`, 2026-10-07)

Objetivo: mostrar cómo desde la Handheld se **surte y embarca un traspaso** (movimiento de inventario entre sucursales). Un traspaso **no genera factura**, así que ese paso se salta; del embarque en adelante el flujo es igual al de un pedido (agregar a embarque activo hacia la misma sucursal o crear uno nuevo → candidatura Uber → formulario → solicitud creada). Detalle y pendientes en `docs/tecnico/traspaso.md`.

Hecho y verificado en navegador (typecheck y build limpios):
- Tareas renombradas: "SURTIDO Y REVISIÓN TRASPASO" (documento "SURTIR TRASPASO") y "EMBARCAR TRASPASO" (TraspasoID 654321) — `src/mocks/pedido.ts` (`TAREAS`).
- Etapa nueva `'traspaso'` en `src/store/AppStore.tsx`; el surtido termina con `setEtapa('traspaso')` y la tarea navega a `/traspaso`.
- Pantalla **Datos del traspaso** `src/screens/traspaso/DatosTraspaso.tsx` (+ `.module.css`, reutiliza `DatosFactura.module.css`): total de piezas, partidas, Empleado / Traspaso / Sucursal destino / Dirección de la sucursal destino (solo lectura) y "Contenido del traspaso". Botones: Cancelar (→ `/tareas`) y Continuar a embarque; ya embarcado: Regresar a tareas. **Sin respaldo en Figma** (compuesta con componentes y tokens existentes).
- Mocks del traspaso en `src/mocks/traspaso.ts` (sucursal destino `0214 | SUCURSAL TESISTÁN`, dirección, `#654321`): **inventados para la demo, PENDIENTE de confirmar**.
- Modales de embarque (`src/screens/facturacion/overlays/FacturacionModals.tsx`) aceptan `unidad="traspaso"` para su texto. `OfrecimientoUberModal` acepta `totalLabel` ("Valor del traspaso").
- `src/screens/uber/SolicitudUber.tsx`: sin `factura.folio` ⇒ modo traspaso (dirección de la sucursal destino, "No. de traspaso", sin fila Factura).
- Escenarios: grupo "Traspaso (sin factura)" en `src/navigation/EscenariosPanel.tsx` / `escenarios.ts` (`tareas-traspaso`, `traspaso`, `traspaso-embarcado`, `traspaso-uber-formulario`, `traspaso-uber-confirmada`). Se prueban con `http://localhost:5173/tareas?escenario=tareas-traspaso`.
- El flujo de pedido (`/facturacion`, `DatosFactura.tsx`) sigue en el código pero ya no se llega desde Tareas.
- La query (`?escenario`, `?paso`, `?overlay`, `?sinActivos`) se lee con `queryActual()` de `src/navigation/query.ts`, no con `window.location.search`.
- `npm run build:artifact` genera `dist-artifact/` (MemoryRouter, base relativa) para publicar una vista previa privada como Artifact de claude.ai. No afecta `npm run dev` ni GitHub Pages (que solo despliega `main`).

Preguntas abiertas para la usuaria: monto que usa la candidatura Uber en un traspaso (hoy: valor a precio de venta, $4,000); si la tarea "SURTIDO Y REVISIÓN UNIFICADA" también se renombra; datos reales de sucursal destino. Siguiente paso posible: pasar las pantallas de traspaso a Figma.

Figma de entregables (escritura permitida, distinto del archivo fuente de arriba): `Solicitud anticipada Uber (ERB-53024)` — https://www.figma.com/design/Zf1wV1oULSD14o7TPW4da9 (plan UX/UI Exodus). Página "Solicitud anticipada Uber" con 4 secciones: Ofrecimiento modal (+ consolidación), Formulario vacío, Formulario precargado, Solicitud Creada (+ toast). Se construyó con `use_figma` en auto-layout, Roboto, a partir de capturas del sitio a 430×932.

Convenciones: entorno de la usuaria en **Windows / PowerShell**; textos de UI en español (MX); commits en español; trabajar en `feature-embarque-de-traspaso` y no subir a `main` sin que lo pida.

## Comandos

- `npm run dev` — servidor de desarrollo (puerto 5173).
- `npm run build` — compila producción (TypeScript + Vite).
- `npm run build:artifact` — compila la vista previa publicable como Artifact en `dist-artifact/`.
- `npm run typecheck` — verifica tipos.
- `npm run test:visual` — corre la comparación visual contra Figma (requiere `npm run dev` en otro terminal).
- `npm run test:domain` — corre las pruebas unitarias de la lógica de Uber (candidatura ERB-53024).
