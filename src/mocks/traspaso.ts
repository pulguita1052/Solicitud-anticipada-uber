/**
 * Datos simulados del traspaso (movimiento de inventario entre sucursales; no genera factura).
 * Sin respaldo en Figma: los valores de sucursal destino y dirección son mocks de demo (PENDIENTE de confirmar).
 * El contenido (partidas y piezas) sale del mismo surtido de `mocks/pedido.ts`.
 */
import { FACTURACION } from './facturacion';

export const SUCURSAL_DESTINO = {
  id: '22',
  nombre: 'Adolf Horn',
  direccion: 'Av. Adolf Horn #147 Col. San Juan Evangelista (San Juan), 45665 Tlajomulco de Zúñiga, Jalisco',
};

export const TRASPASO = {
  id: '147796',
  empleado: FACTURACION.empleado,
  /** No. de solicitud de traspaso (campo "Petición de traspaso"). */
  solicitud: '147796',
  sucursalDestino: `(${SUCURSAL_DESTINO.id}) ${SUCURSAL_DESTINO.nombre}`,
  direccionSucursal: SUCURSAL_DESTINO.direccion,
};
