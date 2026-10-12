# Discrepancias detectadas en Figma

Regla: se replica tal cual lo que está en Figma; aquí solo se registra. Fuente: F0 (2026-09-29).

## Página ⚙️ Configuraciones HH (5170:10163)

| # | Nodo(s) | Discrepancia | Decisión |
|---|---|---|---|
| D1 | 5487:3070, 5918:1978, 5918:2085, 5918:2262, 5918:2519, 5918:2695, 6354:2244 | Nombre de frame con errata: "Prcoesos impresion" (y "Procesos impresion" sin acento en 6354:2147) | Nombrar en código por función; conservar el nombre original en el comentario de cabecera |
| D2 | 5917:1679, 5170:12983, 5342:4089, 5381:890, 5381:1068, 5384:1262, 6398:20921, 6420:21051, 6362:20391 | Nombre genérico "Interfaz principal - NO INICIADO" en pantallas de contenido distinto (Configuraciones, Sonido, Nueva conexión) | Igual que D1 |
| D3 | 5170:12983, 5342:4089 | Las capas internas se llaman "Módulo de surtido", "Modal ingresar cantidad de piezas", "Botones", pero la pantalla muestra la configuración de Sonido (frames copiados de otro módulo) | Revisar en F4 qué capas son visibles; no renderizar lo que no se ve |
| D4 | 5170:21980 | Propiedad de variante sin nombrar: `Property 1` = `Default` / `Variant2` | Mapear a una prop booleana (`checked`) en F3 y registrar el mapeo |
| D5 | 5405:1061, 5431:2553 | Dos componentes distintos con el mismo nombre `print` (36×36 y 20×20) | Distinguir por tamaño en código (`print-36`, `print-20`) |
| D6 | 5918:2841, 5918:2412, 5918:2669, 5411:2107 | Puntos de estado dibujados como elipses "Estado" 8×8 en lugar de instancias del componente `Estado` | Replicar con el componente `Estado` si el valor visual coincide; si no, registrar valor |
| D7 | 6640:1866 vs. 25 instancias | El maestro de `Header` muestra "Menú" y un botón ⋮ que ninguna instancia muestra | Confirmar las propiedades en F3 |
| D8 | 5917:1642 | La pantalla Menú no usa el componente `Header` (encabezado blanco propio) | Construir localmente; candidato a componente |
| D9 | Toasts 5918:5184, 6225:1813 | No usan ninguna variable (colores y tipografía sueltos) | Registrar en `valores-sin-token.md` en F1 |
| D10 | INPUT IP DE IMPRESORA, Notificaciones Toast Verde/Rojo | Parecían instancias sin maestro | **Resuelto:** los toasts están en 24:16 › NO TOCAR; INPUT IP es remoto (set 5234:24179), legible con `use_figma` |

## Página 🔎 Revisión - Durante el surtido (3048:10012)

| # | Nodo(s) | Discrepancia | Decisión |
|---|---|---|---|
| D11 | 3199:4315 y 6048:7053 | Dos frames "Menú" superpuestos en la misma posición; 6048:7053 queda encima | Replicar el visible (6048:7053); comparar ambos en F4 |
| D12 | Casi todos los frames de §1.2–1.7 | Nombres genéricos que no describen el contenido: "Interfaz principal - NO INICIADO/SURTIDO COMPLETO" para Surtido y overlays; "Detalle de producto" en overlays de revisión sobre Surtido (3168:16333, 3168:16454); "Menú 3" (4582:20369) es Asignación de tareas; "Modal  Menú" (doble espacio) para tres overlays distintos | Nombrar en código por función; conservar el nombre original en la cabecera |
| D13 | 3308:17237, 3316:17799 | Overlay simplificado con código 4105000 y descripción "CINCHO PLÁSTICO…" pero foto del foco halógeno | Replicar tal cual en mocks |
| D14 | 3236:5092 → 3236:5261/5348 | Se completa el surtido de 2546000, pero el overlay de revisión muestra 1964000 (foco) | Replicar tal cual |
| D15 | 3120:11941 → 3321:23101 | Tras revisar 4 / 4, el detalle vuelve a mostrar cantidad 3 | Replicar tal cual |
| D16 | 4582:25038, 4582:20287, 6653:8000, 6653:8624 | Errata "Haz surtido y **revisaado** el total…" | Copia literal (regla §5) |
| D17 | 3236:17517 | "(PROXIMAMENTE)" sin acento | Copia literal |
| D18 | Estilo de texto `Text font/B4. Bodyy` | Errata en el nombre del estilo | Token `b4-body`, con `figmaName` original |
| D19 | Asignación de tareas (3199:4226, 3048:10014, 3236:4917, 3236:17517, 4582:20369) | El texto de "Actividad" varía entre secciones: "SURTIDO Y REVISIÓN PEDIDO CLIENTE" / "SURTIR PEDIDO CLIENTE" / "FACTURAR PEDIDO CLIENTE (PROXIMAMENTE)" | Mocks por flujo, con el texto de cada frame |
| D20 | 3086:11540 | El set se llama "Card revisión aleatoria", pero se usa como fila de producto en la lista de Surtido | Componente de código `OrderItemRow` con `figmaName` original |
| D21 | Header de Revisión (frames) vs `Header` 6640:1866 (componente, Configuraciones) | En Revisión el encabezado es un frame, no una instancia; hay que comparar medidas con el componente de Configuraciones | Resolver en F3: un solo componente si coinciden, dos variantes si no |
| D22 | Detalle de producto (R6–R10, R32–R42) | El primer botón inferior alterna entre "Regresar" y "Aceptar" | Replicar por estado; documentar la regla en F5 con la tabla `image 4` |
| D23 | Teclado del sistema (R22, R23) | Mock del teclado de Android dibujado en el frame | No se renderiza (F4.6); lo muestra el teclado real |
| D24 | 6653:8000, 6653:8624 | Frames sueltos fuera de secciones, duplicados de un overlay | Ignorados (P3) |
| D40 | 7020:22451 (❌ Negar totalidad traspaso) | El contador "Pendientes" dice 11 con solo 4 productos en la lista | El contador se calcula del estado (4); se acepta la diferencia en la prueba visual |
| D41 | 7053:27466 | 0486600 aparece "1 de 2" (parcial) pero el avance muestra Parcial 0 / Pendientes 2 | El contador se calcula del estado (Parcial 1 / Pendientes 1) |
| D42 | 7020:21323, 7053:26774, 7114:10987 | En esta página las etiquetas "Actividad", "Fecha", "PedidoID" y "9029" son Regular y los bloques miden 1–2 px menos que en 86:37 | Se conserva `InfoBlock` / `LabeledField` de 86:37 (también lo usan otras pantallas); diferencia de 4.21 % en la prueba visual |
| D43 | ❌ Negar totalidad traspaso (prototipo) | Casi todas las interacciones (`NAVIGATE`) apuntan a destinos vacíos; el flujo no se puede leer de `node.reactions` | Flujo tomado de la descripción del usuario (2026-10-12), ver `flujos-surtido.md` |
| D44 | 7114:10987 | Tras rechazar, Figma repite la misma tarea SURTIR TRASPASO / 123456 | Por indicación del usuario se muestra otra tarea de demo (PedidoID 123461) con "Aceptar" deshabilitado |
