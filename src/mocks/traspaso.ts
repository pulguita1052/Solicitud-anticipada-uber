/**
 * Datos simulados del traspaso (movimiento de inventario entre sucursales; no genera factura).
 * Sin respaldo en Figma: los valores de sucursal destino y dirección son mocks de demo (PENDIENTE de confirmar).
 * El contenido (partidas y piezas) sale del mismo surtido de `mocks/pedido.ts`.
 */
import { FACTURACION } from './facturacion';

export const SUCURSAL_DESTINO = {
  id: '0214',
  nombre: 'SUCURSAL TESISTÁN',
  direccion: 'Huerto 209 Int. 0, Tesistán, 45200 Zapopan, Jalisco.',
};

export const TRASPASO = {
  id: '654321',
  empleado: FACTURACION.empleado,
  traspaso: '#654321 | Traspaso',
  sucursalDestino: `${SUCURSAL_DESTINO.id} | ${SUCURSAL_DESTINO.nombre}`,
  direccionSucursal: SUCURSAL_DESTINO.direccion,
};
