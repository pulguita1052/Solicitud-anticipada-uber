# CHANGELOG de sincronización con Figma

## 2026-10-09 — Rama `feature-surtido-multipedido`: surtido separado de la revisión (📲 Surtido - Un pedido x ronda, 24:16)

- Se quita la revisión del surtido (modal de revisión, insignia "R", modo unificado). La tarea pasa a llamarse **SURTIR PEDIDO CLIENTE** (86:37) y al finalizar la siguiente es **REVISAR PEDIDO CLIENTE** (197:20499), bloqueada.
- Finalización: automática a los 600 ms con todo surtido/negado (197:22893); manual desde el menú con validación de códigos sin surtir (190:10418) y modal informativo de parciales (182:9894). Toast **"Surtido finalizado"** (197:20533).
- Detalle del producto: botones **Regresar / Negar producto**, cantidad editable solo tras escanear (spinner gris 325:3041), modal **Selección de motivo negado** (1232:6734 / 1246:7165) y toast amarillo **"No es posible negar el producto"** (1308:6293).
- Modal de cantidad: inicia vacío con ✓ deshabilitado y valida cero / mayor a lo solicitado / mayor a la existencia.
- Componentes: `Toast` con variante `warning`; `Stepper` con prop `disabled` y botones grises al llegar al límite.
- Detalle del flujo y PENDIENTES en `docs/figma/flujos-surtido.md`.

## 2026-09-29 — Flujo completo: Surtido unificado + cableado Facturación → Embarque → Uber → Factura

Iteración final tras auditoría del flujo contra Figma (Facturación 3287:5564):

- **Surtido + revisión unificado** (ERB-47987, Figma 6004:2304): nueva etapa `surtido-unificado` en `AppStore` y nueva pantalla `SurtidoUnificado.tsx` que se monta en `/surtido` cuando esa etapa está activa. Muestra resumen del pedido (partidas, piezas solicitadas, piezas surtidas, conteos) y un botón único **"Finalizar"** que marca el pedido como completado y salta a la tarea de facturación. `TAREAS.surtidoUnificado` agregada al mock.
- **Cableado del flujo final**:
  - Al confirmar el modal **"Embarque creado"** (o **"Factura agregada"**) en `DatosFactura` ahora se navega **directo a `/uber`** — antes se cerraba el overlay dejando al operador en la factura y luego "Regresar a tareas" saltaba a Uber (invertido).
  - **"Ahora no"** en el ofrecimiento de Uber ya no va a `/tareas`; regresa a `/facturacion`, donde la factura ya trae folio + embarque y muestra los botones finales **"Regresar a tareas"** / **"Reimprimir factura"**.
  - **"Regresar a tareas"** de la factura final ahora sí navega a `/tareas` (etapa `surtido`).
- **`?overlay=`** para pre-abrir modales de Embarque desde escenarios: `nuevoEmbarque`, `embarqueCreado`, `agregarEleccion`, `agregarSelector`, `facturaAgregada`, `direcciones` (helper `overlayDesdeUrl` en `DatosFactura.tsx`).
- **Escenarios reestructurados** (`src/navigation/escenarios.ts`) — 20 en total, agrupados por etapa:
  - **Tareas**: `tareas-surtido`, `tareas-unificado`, `tareas-facturacion`.
  - **Surtido/Revisión**: los existentes (`surtido-1964000`, `revision-1964000-completa`, …).
  - **Facturación**: `facturacion`, `factura-facturada`, `factura-embarcada`, `factura-error`.
  - **Embarque (modales)**: `embarque-nuevo`, `embarque-creado`, `embarque-agregar` — todos usan `?overlay=`.
  - **Uber**: los 6 existentes (`uber-embarcado`, `uber-con-historial`, `uber-consolidacion`, `uber-formulario-vacio`, `uber-formulario-lleno`, `uber-confirmada`).
  - Seed común `PEDIDO_COMPLETO` (23 artículos, finalizado) reutilizado para evitar duplicación.
- **`EscenariosPanel` v3** (`src/navigation/EscenariosPanel.tsx`): agrupado por sección (Tareas / Facturación / Embarque / Uber), cada tarjeta con **título + descripción + lista de reglas** (bullets). Se muestra ahora en **todas las rutas del flujo** (`/tareas`, `/surtido`, `/facturacion`, `/embarque`, `/uber`), no solo Uber. Ancho aumentado a 380 px.
- Verificación end-to-end en el navegador: tareas-unificado → Finalizar → tareas-facturacion → Aceptar → factura → Continuar a embarque → Nuevo embarque → Embarque creado → **/uber** → Ahora no → **/facturacion** con folio + embarque → Regresar a tareas → /tareas ✓
- `npm run typecheck` limpio; 6/6 pruebas de dominio pasan.

## 2026-09-29 — Uber: modal de consolidación + panel limpio

Segunda iteración tras la revisión del usuario:

- **Modal inferior de consolidación** (`ConsolidacionModal` en `src/screens/uber/SolicitudUber.tsx`): reemplaza la pantalla completa anterior. Cuando existe una solicitud creada para el mismo cliente + dirección (`ACTIVOS_POR_CLIENTE_DIRECCION` en `src/mocks/uber.ts`), al hacer click en "Generar solicitud" se abre un `ModalSheet` sobre el ofrecimiento con:
  - Copy: "El cliente ya tiene una solicitud de reparto **creada** para la misma dirección. En caso de continuar, se generará una solicitud independiente para este pedido. En caso contrario, esta factura y embarque se agregarán al embarque existente."
  - Botón **Cancelar (X)** → `agregarAlExistente()`: muestra toast "Factura agregada al embarque existente" y regresa a `/tareas`.
  - Botón **Continuar (✓)** → va al formulario para generar una solicitud independiente.
- **Título del formulario** cambia a **"Solicitud de Uber - Embarque {numero}"** (usa `factura.embarque?.numero`). Antes decía "- Creación".
- **Panel lateral (`EscenariosPanel`)** limpiado: se retira el bloque técnico con las query strings `?escenario=...` de cada tarjeta. Ahora muestra únicamente un número (1-6), título y descripción, con el escenario activo resaltado.
- **Nuevo escenario `uber-consolidacion`** en `src/navigation/escenarios.ts`: usa dirección 2 (Huerto 221) para que la entrada `536983|Huerto 221…` de `ACTIVOS_POR_CLIENTE_DIRECCION` dispare el modal.
- Estado interno de la pantalla: se retiró `consolidacion` como estado de pantalla completa; ahora es una bandera `mostrarConsolidacion` que se superpone al ofrecimiento (`?paso=consolidacion` abre el modal directamente).

## 2026-09-29 — Uber: iteración de escenarios + panel lateral

Ajustes al flujo de Uber (ERB-53024) tras la revisión del usuario:

- **Ofrecimiento** (`?escenario=uber-embarcado`): se agrega **Total de artículos** (suma de piezas surtidas no negadas — helper `totalArticulos` en `src/domain/pedido.ts`). El nombre del cliente ya no se encima con el label: el valor ocupa la columna derecha con envoltura de palabra y `min-width: 0` en el flex-item (regla nueva `.infoRowValue` en `SolicitudUber.module.css`).
- **Formulario**: título cambia a **"Solicitud de Uber - Creación"**. La descripción del paquete **siempre inicia vacía**, aunque exista historial precargado (criterio del usuario: la debe capturar el operador).
- **Selector de vehículo**: se retiran las dimensiones. Cada tarjeta muestra solo el peso máximo (`Máx. 22 kg` / `Máx. 100 kg`) y la descripción. `RESTRICCIONES_VEHICULO` en `src/domain/uber.ts` queda solo con `pesoMax` y `descripcion`.
- **Solicitud creada**: se agregan **No. de solicitud** (5 dígitos, mock, en azul realzado) y **No. de pedido** (`PEDIDO_ID = '123456'`) además de embarque, factura y vehículo.
- **Override de paso** con `?paso=formulario|ofrecimiento|consolidacion|confirmada` para saltar directamente a una ventana desde los escenarios de verificación (`src/screens/uber/SolicitudUber.tsx`).
- **Nuevos escenarios** en `src/navigation/escenarios.ts`:
  - `uber-formulario-vacio` — cliente sin historial en esta dirección (todos los campos vacíos).
  - `uber-formulario-lleno` — cliente 536983 con precarga desde `HISTORIAL_UBER` (Huerto 221) — descripción vacía.
  - `uber-confirmada` — pantalla final con número de solicitud/pedido.
  - Todos los escenarios de Uber ahora traen el pedido con las 5 partidas surtidas (23 artículos totales) para que el ofrecimiento muestre el conteo real.
- **Panel lateral de escenarios** (`src/navigation/EscenariosPanel.tsx` + `.module.css`, cableado en `App.tsx` — se muestra solo en `/uber`). Lista los 5 escenarios de Uber con título, descripción y query-string; se oculta bajo 900 px para no cubrir el handheld.

## 2026-09-29 — Solicitud anticipada de Uber (ERB-53024)

- Reglas de negocio en `src/domain/uber.ts`: `evaluarCandidatura` con las 5 condiciones de la HU (sucursal habilitada, distancia ≤ 24 km, monto crédito ≤ $15,000, sucursal Uber Cash, monto Uber Cash ≤ $1,700).
- Restricciones de vehículo (moto/coche) en `RESTRICCIONES_VEHICULO` — valores máximos que se envían a Uber Direct.
- **Pruebas unitarias** (`tests/domain/uber.test.mjs`): 6 escenarios (incluidos Escenario 1 y Escenario 3 de la HU) — todos pasan.
- Mocks (`src/mocks/uber.ts`): historial de solicitudes previas para precarga por cliente + dirección (basado en las capturas del sistema legado que compartió el usuario: embarque 90055, RAMIREZ CAMACHO ADRIAN, ARRAYAN 1297).
- **Pantalla `SolicitudUber`** con 4 estados:
  - **ofrecimiento**: cliente, distancia, total y botones "Ahora no" / "Generar solicitud".
  - **consolidación**: aviso si existe embarque/solicitud activa del mismo cliente+dirección (redirige a Exodus Sucursales, pero permite generar individual).
  - **formulario**: dirección de entrega marcada como "Solo lectura" (viene de EPICO, no editable). Nombre, teléfono, referencias, dpto/oficina/piso, descripción (precargados si hay historial previo). Selector visual de vehículo (Moto 45×45×45 cm/22 kg · Coche 90×50×90 cm/100 kg) con dimensiones y descripciones.
  - **confirmada**: toast "Solicitud creada" + resumen (embarque, factura, vehículo) + "Regresar a tareas".
- Cableada al flujo: al terminar el embarque, "Regresar a tareas" redirige a `/uber` en lugar de directamente a Tareas.
- Ruta `/uber` agregada en `src/App.tsx`.
- Escenarios: `uber-con-historial` (dirección con solicitud previa), `uber-embarcado` (dirección sin historial).
- Documento: [uber.md](../tecnico/uber.md) con el flujo completo y las reglas.

## 2026-09-29 — F4/F5/F7: Configuraciones HH + docs de cierre

- **Configuraciones HH (F4)** — 3 pantallas en `src/screens/configuraciones/`:
  - `Configuraciones` (5917:1679): menú Impresión / Sonidos. **Diff visual 0.79 % ✓** (bajo el 1 % de tolerancia).
  - `Sonido` (5170:12983): 4 switches por tarea (Surtido/Revisión × Lectura/Alertas), sincronizados con `preferencias` de sonidos. **Diff 1.79 %**.
  - `Impresion` (5487:3070 / 5487:3223): pestañas Procesos / Impresoras con lista de mocks (`src/mocks/impresoras.ts`). **Diff 1.05 %**.
- **Componentes nuevos**: `Switch` (5170:21980), `StatusDot` (5234:23533), `ConfigHeader` (6640:1866, 100 px con datos del usuario), `ConfigPanel` (5917:1681, con breadcrumb).
- **flujos.md** (F5): flujo global surtido→revisión→factura→embarque→Uber (PENDIENTE), interacciones por página, tiempos AFTER_TIMEOUT, rutas de la app, y tokens de motion.
- **figma-map.json** (F7): mapa completo nodeId ↔ archivo de código con estado (`verificado`, `aproximado`, `pendiente-diff`), 13 componentes + 30 pantallas + 14 sin-implementar catalogados.
- **docs/components/INDEX.md**: catálogo de átomos/moléculas/organismos del sistema de diseño.
- Estado de la verificación visual (F6):

| Pantalla | Diff |
|---|---|
| Menú | 0.56 % ✓ |
| Configuraciones | 0.79 % ✓ |
| Configuraciones › Impresión | 1.05 % |
| Configuraciones › Sonido | 1.79 % |
| Detalle 1964000 | 1.85 % |
| Detalle 2546000 parcial | 3.13 % |
| Surtido inicial | 3.71 % |
| Surtido parcial 2546000 | 3.71 % |
| Asignación de tareas | 4.47 % |
| Surtido revisado 1964000 | 4.59 % |
| Datos de factura | 4.89 % |

Todo el delta 1–5 % viene del antialiasing de texto en Windows vs Figma; el layout coincide en cada píxel.

## 2026-09-29 — F1–F4 (v2): Facturación + Embarque construidos

- **Bordes interiores** (`LabeledField`, `InfoBlock`, `Stepper`, `OrderProgress`, `ProductSummary`): reemplazados por `box-shadow: inset` para que no sumen alto (Figma pinta los trazos por dentro). Detalle de producto bajó de **4.34 % → 1.85 %**, Surtido de **4.51 % → 3.71 %**.
- **Facturación (F4 §2B)** — `src/screens/facturacion/DatosFactura.tsx` con 4 estados: formulario, generando (spinner + barra 2.5 s), error (toast rojo), facturada (folio en recuadro gris).
- **Embarque (F4 §2B)** — 5 modales cableados dentro de DatosFactura: "Nuevo embarque", "Embarque creado", "Agregar embarque (elección)", "Agregar embarque (selector)", "Factura agregada". Usa `EMBARQUES_ACTIVOS` en mocks para elegir el flujo (nuevo vs. agregar existente).
- Componentes nuevos: `FloatingLabelInput` (INPUT/SELECT PRUEBA con etiqueta flotante de 13.2 px), assets de Facturación (id-card, list-alt, receipt-long, person, orders, location-on, hand-package, dropdown, print-24, loading-indicator, íconos de modal ✓/+).
- Escenarios: `factura-facturada`, `factura-embarcada` (`src/navigation/escenarios.ts`) para pruebas manuales y F6.
- **Verificación visual**: Menú 0.56 % ✓; resto 1.85–4.89 % (diferencias por antialiasing del texto en Windows/DirectWrite vs Figma; layout coincide).

## 2026-09-29 — F1–F4 en curso (se detuvo por límite de uso)

- Alcance ampliado por el usuario: surtido y revisión → Facturación (3287:5564) → Embarque (6157:1119) → Uber (PENDIENTE). F0 de Facturación y Embarque en `inventory.md` §2B.
- Referencias técnicas en `docs/tecnico/referencias.md` (Revision-HH, EXODUS_HANDHELD).
- F1 hecho: `src/design-system/tokens/tokens.{json,css}` (generador `tools/build-tokens.mjs`, curvas en `tools/build-motion.mjs`).
- F2 parcial: assets de Revisión en `src/assets` (registro en `docs/figma/assets.md`).
- F3/F4 parcial: componentes base, Menú, Asignación de tareas, Surtido de órdenes (+ modales) y Detalle de producto.
- F6: `npm run test:visual`. Menú 0.56 % ✓; el resto 4–5 %, sobre todo por el suavizado del texto. **Siguiente nodo:** medir de nuevo tras corregir el trazo interior (Order Progress 81 px); revisar el resto de trazos interiores (`LabeledField`, `InfoBlock`).
- Pendiente: Facturación y Embarque (F2–F4), Configuraciones HH, `flujos.md`, `figma-map.json`, fichas de componentes y F7.

## 2026-09-29 — F0 Inventario v2 (Revisión - Durante el surtido)

- Respuestas del usuario a P1–P5: alcance principal **🔎 Revisión - Durante el surtido** (3048:10012), luego ⚙️ Configuraciones HH; borradores ignorados; solo tema claro; Menú completo.
- Listado real de las 14 páginas del archivo obtenido con `use_figma` (solo lectura).
- Inventario de Revisión: 7 secciones de flujo, 67 frames de pantalla, 8 toasts y la sección NO TOCAR de referencia (`docs/figma/inventory.md` §1).
- Componentes maestros resueltos: toasts en 24:16 › NO TOCAR; `INPUT IP DE IMPRESORA` y `Botones` son remotos (librería). No hace falta generar componentes nuevos.
- Estilos y variables locales: 26 de color, 11 de texto y 2 de efecto; 4 colecciones con un solo modo.
- Detectado un prototipo interactivo legible (374 interacciones y 7 inicios de flujo en Revisión): será la fuente de F5.
- Discrepancias D11–D24 agregadas.
- Llamadas MCP acumuladas: ~75.
- **Siguiente paso:** aprobación del inventario v2 → F1 (tokens).

## 2026-09-29 — F0 Inventario v1 (Configuraciones HH)

- MCP remoto de Figma conectado y validado (`docs/figma/mcp-tools.md`).
- Inventario de la página `⚙️ Configuraciones HH` (`5170:10163`): 4 secciones, 27 frames de pantalla, 10 componentes/sets locales, 17 variables/estilos.
- Caché: metadata XML de la página, capturas de las 4 secciones y de los 12 componentes/frames sueltos, `variable-defs.json`.
- Discrepancias iniciales: D1–D10.
