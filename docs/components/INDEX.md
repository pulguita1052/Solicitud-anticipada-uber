# Sistema de diseño — componentes

Todos los componentes viven en `src/design-system/components/`. La cabecera de cada archivo `.tsx` incluye su `nodeId` de Figma y la fecha de última sincronización (regla F3.9 de `FIGMA_REPLICA.md`).

## Átomos

| Componente | nodeId Figma | Descripción |
|---|---|---|
| `Button` | 9:92 (remoto) | Botón principal con variantes `default`, `error`, `success`, `disabled`, `outline`. Puede recibir un `asset` (SVG plano de Figma como en 3048:10094) o `icon: 'cross' \| 'check'`. |
| `Chip` | 3086:11545 | Chip "N de M" (o "Negado") con variantes `no-iniciado`, `parcial`, `completado`, `negado`, `negado-promocion`. |
| `RBadge` | 3137:15180 | Insignia "R" (revisado) sobre círculo verde de 20 px. |
| `Divider` | 3048:10036 / 3060:12587 / 3048:10165 | Líneas con variantes `title` (1.5 px), `modal` (1 px), `list` (2 px). |
| `ProgressBar` | 3095:16641 | Barra de progreso 0–1 con degradado azul (14.9 % / 54.8 % / 100 %). |
| `Stepper` | 3199:6429 | Selector de cantidad − / valor / +. |
| `Switch` | 5170:21980 | Interruptor 61.7 × 33 con thumb 29 px. `checked` mapea a `Property 1 = Variant2`. |
| `StatusDot` | 5234:23533 | Punto de 8 px de color (conectada · sin-conexion · conectando · no-disponible). |

## Moléculas

| Componente | nodeId Figma | Descripción |
|---|---|---|
| `ScanInput` | 3048:10192 | Barra de escaneo (Teclado ⌨ + Input). Modo `inputMode="none"` por defecto (lector HID); alterna a `text` con el botón. |
| `LabeledField` | 3062:12615 / 3048:10042 | Etiqueta azul + valor blanco. `labelWidth: 'fixed' \| 'hug'`. |
| `InfoBlock` | 3048:10057 | Cabecera azul con ícono + N filas blancas. Soporta pares `label: value`. |
| `OrderProgress` | 1324:7100 | Panel "Avance del pedido" con contadores Completado · Negado · Parcial · Pendientes. |
| `OrderItemRow` | 3086:11540 | Fila de la lista de productos con chip de estado, ubicación e insignia R opcional. |
| `ProductSummary` | 3062:12611 / 3199:6382 | Foto (bordered/framed) + Código + Descripción. |
| `FloatingLabelInput` | 3872:16599 | Campo con etiqueta flotante (INPUT/SELECT PRUEBA). Soporta `isSelect` con ícono ▼. |
| `DataTable` | — (sin respaldo en Figma) | Tabla de la HH: hasta 3 columnas visibles; con más (o con columnas `ancho: 'contenido'` que no caben), scroll horizontal y flecha ▶. `columnasFijas` (0–2) deja la 1.ª y/o 2.ª columna fijas. |

## Organismos

| Componente | nodeId Figma | Descripción |
|---|---|---|
| `AppHeader` | 3048:10139 | Header 90 px de Revisión y Facturación (flecha ← + "Menú" + ⋮). |
| `ConfigHeader` | 6640:1866 | Header 100 px de Configuraciones (flecha + persona + nombre + ID). |
| `ContentPanel` | 3048:10150 | Panel blanco de Revisión con título centrado y divisor 1.5 px. |
| `ConfigPanel` | 5917:1681 | Panel blanco de Configuraciones con breadcrumb "Título > Subtítulo". |
| `BottomBar` | 3048:10092 / 3048:10126 / 3199:6476 | Barra inferior 124 px con variantes `actions`, `footer`, `exit`. |
| `ModalSheet` | 3060:12583 | Hoja inferior con ícono circular sobresaliente. Soporta `doubleShadow` para pendientes/promoción. `ModalHeader` y `ModalIcon` son subcomponentes. |
| `Toast` | 192:16685 / 131:6148 | Aviso oscuro 416 × 106 con barra inferior verde/roja. Variantes `success` / `error` y estado `fin` (barra se contrae en 3 s). |

## Casos de uso por pantalla

Ver `docs/figma/figma-map.json` para el mapeo completo pantalla → archivo.
