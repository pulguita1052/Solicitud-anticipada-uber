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
          ├─ código que no pertenece al pedido → toast "Producto incorrecto" (captura del usuario, sin frame en Figma)
          ├─ tap card → Detalle del producto (131:6465)
          │     cantidad editable solo si el producto ya se escaneó (sticky note 325:3051, spinner gris 325:3041)
          │     tocar la foto → overlay "Vista foto" (Frame 208 → 162:6994); solo se cierra con ✕, sin zoom
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
| Overlay "Vista foto" (2026-10-14) | Se cierra solo con la ✕ y no admite zoom, igual que en sucursal. |
| Aviso para un código que no pertenece al pedido (2026-10-14) | Toast rojo "Producto incorrecto" / "El producto escaneado no pertenece a este pedido.", tomado de una captura del usuario. |

## PENDIENTE

| Punto | Estado |
|---|---|
| Mock de 2 productos vs. 11 de Figma | Se conserva el de 2; por eso las pantallas no entran en la prueba píxel a píxel. |

---

# Multipedido — ronda de hasta 3 pedidos (sin Figma)

Rama `feature-surtido-multipedido`. La página `📲 Surtido - Multi. pedido x ronda` (2888:9537) está vacía: el flujo se diseña primero en código y después se pasa a Figma (D48). Requisito confirmado por stakeholders: **máximo 3 pedidos por ronda**. Contexto de sucursal (usuario, 2026-10-14): los operarios recogen todo en los anaqueles y escanean en la mesa de preparación; los pedidos suelen ser chicos (2–5 códigos) o grandes (~14); límite de ~25 min desde la captura en Entrega Local; la espera antes de iniciar (mediana 6 min, promedio 15.3 min) pesa más que el surtido (mediana 1.1 min).

**Decisión (2026-10-15): se sigue con la propuesta A.** B, C y el flujo de un pedido siguen en el código pero ocultos en el panel de escenarios. La interfaz principal y la vista filtrada por pedido de A siguen los mockups de `Handheld for Claude` › Surtido multipedido (archivo `Zf1wV1oULSD14o7TPW4da9`, frames 15:1437 y 15:1661; capturas en `docs/figma/cache/multipedido/`): título "Surtido de órdenes", "Avance de la ronda", tarjetas de contenedor (tocar una filtra la lista a su pedido y atenúa las demás; tocarla otra vez quita el filtro) y cards con desglose por contenedor. Lo que los mockups no definen está en D49.

```
Asignación de tareas — SURTIR RONDA DE PEDIDOS · Contenedor A 123456 / B 123457 / C 123458
 ✓ → Detalle de la ronda (antes de surtir, D50): contenedor ↔ pedido, cliente, hora de captura, piezas y códigos
     pedidos del mismo cliente (venta dividida, p. ej. cable 20 m + 1 m) → aviso amarillo + tarjetas marcadas + código en común resaltado
     Regresar → Asignación de tareas · Iniciar surtido →
 Surtido de ronda
     A · Avance de la ronda + tarjetas de contenedor + lista consolidada por ubicación (total por código + desglose A/B/C)
         tocar contenedor → vista filtrada: solo sus códigos con su avance, sin desglose (15:1661)
         escaneo → toast "Coloca <código> · Contenedor A: n pz · B: n pz" (reparto del pedido más antiguo al más reciente)
     B · parada por parada (una ubicación a la vez): solo acepta el código de la parada,
         indica cuántas piezas van a cada contenedor y pasa sola a la siguiente parada incompleta
     C · lista consolidada sin separar: solo cuenta piezas recolectadas
     comunes: "Piezas de más" si sobran, "Pedido N completo" al llenar un contenedor,
              código de 7 dígitos → modal de cantidad, "Producto incorrecto" si no es de la ronda
     todo completo → 600 ms → "Finalizar ronda" · Menú ⋮ › Finalizar ronda con faltantes → modal informativo
 A, B: fin → REVISAR PEDIDO CLIENTE (bloqueada) + toast "Ronda finalizada"
 C:    fin del surtido → REVISAR Y SEPARAR RONDA (se puede aceptar) → "Revisión y separación"
         escaneo reparte en contenedores, sin pasar de lo recolectado → fin → FACTURAR Y EMBARCAR PEDIDO (bloqueada)
```

## Reglas de la propuesta (sin respaldo; por validar con operación)

| Punto | Regla del prototipo |
|---|---|
| Reparto de piezas de un código compartido | Del pedido capturado antes al más reciente; el faltante cae en el más reciente. |
| Pedido completo | Aviso al llenar su contenedor; en A y B pasa a revisión, en C a facturación. |
| Faltantes al finalizar | Modal informativo por pedido (o por código en la recolección de C); se puede finalizar. |
| Negar producto | No se implementa en la ronda; lo que no se surte queda como faltante. |
| Contenedores | Identificados por letra; no se escanea el contenedor. |

## Preguntas abiertas

1. ¿La revisión la hace la misma persona que surte, en la misma mesa? (Define si C es viable.)
2. ¿Cómo se forma la ronda: el sistema agrupa por hora de captura o el operario elige? ¿Cuánto se espera para juntar 3?
3. ¿Los pedidos grandes (~14 códigos) entran en ronda o van solos?
4. Faltantes compartidos: ¿prioridad por antigüedad del pedido u otra regla?
5. ¿El límite de 25 min se mide por pedido o por ronda?
6. ¿Los contenedores tienen etiqueta escaneable?
