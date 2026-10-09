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

## PENDIENTE

| Punto | Decisión provisional |
|---|---|
| Destino del ✓ de "Selección de motivo negado" (1246:7612 navega a un nodo vacío) | Niega el producto y regresa a Surtido de órdenes. |
| Opciones del select de motivo | Solo "Sin existencia" (la única visible en Figma). |
| Existencia de 1394000 (no aparece en Figma) | 100, la de la cinta 1394001 (131:6465). |
| Aviso para un código que no pertenece al pedido | Solo sonido de error (igual que antes). |
| Overlay "Vista foto" (162:6994) al tocar la foto del Detalle | No implementado. |
| Mock de 2 productos vs. 11 de Figma | Se conserva el de 2; por eso las pantallas no entran en la prueba píxel a píxel. |
