# Flujo de surtido (sin revisión) — 📲 Surtido - Un pedido x ronda (24:16)

Rama `feature-surtido-multipedido`. Fuentes: interacciones del prototipo (`node.reactions`, leídas con `use_figma` en solo lectura), textos de los frames y el flujo escrito por el usuario (2026-10-09). Capturas de las secciones en `docs/figma/cache/surtido/`.

## Flujo

```
Menú
 └─ Tareas → Asignación de tareas (SURTIR PEDIDO CLIENTE, 86:37)
     ✓ → Surtido de órdenes (109:357)
          ├─ etiqueta de 18 dígitos → suma la cantidad (dígitos 8–13) (1007:4012 → 131:4198)
          ├─ código de 7 dígitos → modal "Ingresa la cantidad surtida en contenedor" (330:3096 → 131:6184)
          │     ✓ deshabilitado mientras está vacío (sticky note 321:3020)
          │     cantidad 0 / mayor a la solicitada / mayor a la existencia → toast "Cantidad inválida" (986:3915 · 131:6181 · 188:10280)
          ├─ código inválido → toast "Código inválido" (325:3026)
          ├─ código de un producto negado → toast "Producto negado" (1509:9441)
          ├─ tap card → Detalle del producto (131:6465)
          │     cantidad editable solo si el producto ya se escaneó (sticky note 325:3051, spinner gris 325:3041)
          │     "Regresar" / ← → Surtido de órdenes (131:4492)
          │     "Negar producto" con cantidad > 0 → toast amarillo "No es posible negar el producto" (1308:6293)
          │     "Negar producto" con cantidad 0 → "Selección de motivo negado" (1232:6734 → 1246:7165)
          │         ✓ deshabilitado hasta elegir motivo · ✕ vuelve al Detalle
          ├─ todo completo o negado → 600 ms → modal "Finalizar surtido" (197:22719 → 197:22893)
          │     ✕ → Surtido de órdenes · ✓ → fin
          └─ ⋮ → Menú (182:9267): Repetir audio / Finalizar surtido / ✕
                Finalizar surtido:
                  ¿códigos sin surtir? → "No es posible finalizar surtido" (190:10418), solo ✕
                  ¿códigos parciales?  → "Finalizar surtido" informativo (182:9894) ✕ / ✓ → fin
                  si no → fin
fin → Asignación de tareas con "REVISAR PEDIDO CLIENTE" (197:20499) + toast "Surtido finalizado" (197:20533)
      Aceptar deshabilitado: la revisión está fuera del alcance de esta rama.
```

## Validaciones de finalización que se omiten (por indicación del usuario)

- Pedido corporativo con productos negados → "Pedido retirado de ronda" (1490:8747).
- Promociones AxB surtidas parcialmente (1191:6796).
- Error de red al finalizar (2105:9790).
- Validaciones de etiqueta única (sección 1018:4173) y "Longitud > 51 y < 100" (1007:4015).

## Decisiones confirmadas por el usuario (2026-10-09)

| Punto | Decisión |
|---|---|
| Destino del ✓ de "Selección de motivo negado" (1246:7612 navega a un nodo vacío) | Niega el producto y regresa a Surtido de órdenes. |
| Opciones del select de motivo | Solo "Sin existencia" (la única visible en Figma). |
| Existencia de 1394000 (no aparece en Figma) | 100, la de la cinta 1394001 (131:6465). |

## PENDIENTE

| Punto | Estado |
|---|---|
| Aviso para un código que no pertenece al pedido | Por ahora solo sonido de error. El usuario compartirá el aviso. |
| Overlay "Vista foto" (162:6994) al tocar la foto del Detalle | Se implementa más adelante. |
| Mock de 2 productos vs. 11 de Figma | Se conserva el de 2; por eso las pantallas no entran en la prueba píxel a píxel. |

---

# Rechazar traspaso — ❌ Negar totalidad traspaso (6874:864)

Rama `feature-rechazar-traspaso`. Permite rechazar (negar) completo el surtido de un traspaso entre sucursales sin negar producto por producto. Hay **dos propuestas** que se eligen desde el panel de escenarios (`?escenario=p1-…` / `p2-…`). Fuentes: frames de la página y el flujo escrito por el usuario (2026-10-12). El prototipo no sirve como fuente: sus `NAVIGATE` apuntan a destinos vacíos (D43). Capturas en `docs/figma/cache/rechazar-traspaso/`.

```
Asignación de tareas — SURTIR TRASPASO · PedidoID 123456 (7020:21323 / 7053:26774)
 ✓ → Surtido de órdenes (7020:22451: 4 productos · 7053:26345: 2 productos)
      ⋮ → Menú
         Propuesta #1 (7020:25441)
           todos los productos en 0 → Repetir audio · Rechazar traspaso (rojo) · Finalizar surtido (gris, deshabilitado)
           alguna pieza surtida     → menú de siempre (182:9267): Repetir audio · Finalizar surtido
         Propuesta #2 (7053:26441), sin importar lo surtido o negado
                                    → Repetir audio · Rechazar traspaso (azul) · Finalizar surtido (rojo, activo)
      Rechazar traspaso → "Rechazar traspaso" (7020:25766 / 7053:26522)
           ¿Deseas rechazar el traspaso? + Sucursal destino / Petición / Tipo
           propuesta #2: leyenda "Las piezas surtidas se marcarán como rechazadas." (siempre)
           ✕ → Surtido de órdenes · ✓ → motivo
      Motivo (7040:25916 → 7040:26148): ✓ deshabilitado hasta elegir motivo · ✕ → Surtido de órdenes
           ✓ → Asignación de tareas con otra tarea (Aceptar deshabilitado) + toast "Traspaso rechazado" (7114:10987 + 7114:11110)
```

## Decisiones confirmadas por el usuario (2026-10-12)

| Punto | Decisión |
|---|---|
| Productos | Los de Figma: 0486600 / 1365800 / 1394001 / 2389475 (propuesta #1) y 0486600 / 1365800 (propuesta #2). |
| Pantalla tras rechazar | Otra tarea de demo que no se puede tomar (SURTIR TRASPASO · PedidoID 123461 · 12:15 p.m.). |
| Motivos de rechazo | Se ignora el texto de relleno de Figma; motivos de demo realistas en `MOTIVOS_RECHAZO` (`src/mocks/pedido.ts`). |
| Leyenda de la propuesta #2 | Se muestra siempre, aunque no haya piezas surtidas. |

## Interpretaciones (sin respaldo explícito)

| Punto | Interpretación |
|---|---|
| "Todos los productos en 0" (propuesta #1) | Ningún producto con cantidad surtida > 0; un producto negado cuenta como 0. Si en el Detalle se regresa la cantidad a 0, vuelve a aparecer el botón. |
| ✕ de la confirmación y del motivo | Cierran el modal y regresan a Surtido de órdenes. |
| Efecto del rechazo en la propuesta #2 | El traspaso queda rechazado con su motivo (`motivoRechazo`); no hay pantalla que muestre las piezas marcadas como rechazadas. |

## PENDIENTE

| Punto | Estado |
|---|---|
| Descripción, existencia, precio y foto de 0486600, 1365800 y 2389475 | Figma solo tiene el detalle de 1394001 (131:6465); el resto son datos de demo sin foto. |
| Catálogo real de motivos de rechazo | Motivos de demo. |
| Destino de "Finalizar surtido" en un traspaso | Se conserva el de pedido cliente: siguiente tarea REVISAR PEDIDO CLIENTE (bloqueada). |
