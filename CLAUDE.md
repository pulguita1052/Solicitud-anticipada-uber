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

## Rama `feature-surtido-multipedido` (2026-10-09)

Alcance reducido a **solo el flujo de surtido**: Menú → Asignación de tareas → Surtido de órdenes (+ revisión, detalle de producto, modo unificado). Al finalizar el surtido, Asignación de tareas muestra la siguiente tarea "FACTURAR Y EMBARCAR PEDIDO" con **Aceptar deshabilitado**. Se quitaron las pantallas de facturación, embarque, Uber y configuraciones (siguen en `main`). Lo de abajo describe `main`.

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

## Comandos

- `npm run dev` — servidor de desarrollo (puerto 5173).
- `npm run build` — compila producción (TypeScript + Vite).
- `npm run typecheck` — verifica tipos.
- `npm run test:visual` — corre la comparación visual contra Figma (requiere `npm run dev` en otro terminal).
