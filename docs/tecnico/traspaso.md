# Embarque de traspaso

Variante del flujo de pedido para mostrar cómo se **surte y embarca un traspaso** desde la HH. Un traspaso es solo un movimiento de inventario entre sucursales: **no genera factura**, así que se omite ese paso.

## Flujo

```
Tarea "SURTIDO Y REVISIÓN TRASPASO" → surtido / revisión (igual que pedido)
 └─ Tarea "EMBARCAR TRASPASO" → Datos del traspaso (/traspaso)
      ├─ Cancelar → tareas
      └─ Continuar a embarque
           ├─ hay embarques activos a la misma sucursal → "Agregar embarque": nuevo o existente
           └─ no hay → "Nuevo embarque"
                └─ traspaso con embarque → ¿candidato Uber (ERB-53024)? → ofrecimiento → formulario → solicitud creada
```

## Datos del traspaso (sin respaldo en Figma)

Empleado · Traspaso · Sucursal destino · Dirección de la sucursal destino (solo lectura) · Total de piezas, partidas y contenido. Sin impresión, forma de pago ni "Generar factura".

## Diferencias respecto al pedido

| Tema | Pedido | Traspaso |
|---|---|---|
| Tareas | FACTURAR Y EMBARCAR PEDIDO | EMBARCAR TRASPASO |
| Factura | Se genera (folio) | No aplica |
| Destino | Cliente + dirección de entrega | Sucursal destino + su dirección (solo lectura) |
| Uber: monto | Total del pedido | Valor de la mercancía del traspaso (mismas reglas de candidatura) |
| Uber: confirmación | No. de pedido + Factura | No. de traspaso (sin Factura) |

## PENDIENTE de confirmar (mocks de demo)

- Sucursal destino `0214 | SUCURSAL TESISTÁN`, su dirección y el traspaso `#654321` son datos inventados para la demo (`src/mocks/traspaso.ts`).
- La tarea unificada ("SURTIDO Y REVISIÓN UNIFICADA") conserva su texto de pedido.
- Qué monto usar para la candidatura Uber de un traspaso (hoy: valor a precio de venta del surtido).
