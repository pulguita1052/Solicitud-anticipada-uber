/**
 * Estado del pedido durante el surtido y la revisión.
 * Reglas: prototipo de Figma (docs/figma/flujos.md) + referencias técnicas (docs/tecnico/referencias.md).
 */
import { PEDIDO_ID, PRODUCTOS, PROMOCIONES, type ProductoPedido, type TipoRevision } from '../mocks/pedido';
import type { OrderItemStatus } from '../design-system/components/molecules/OrderItemRow/OrderItemRow';

export type ItemState = {
  codigo: string;
  surtido: number;
  /** Piezas revisadas (escaneo forzoso). */
  revisado: number;
  /** "R" en la fila. Se restablece si cambia la cantidad surtida (sección "Revisión restablecida"). */
  revisionCompleta: boolean;
  negado: boolean;
};

export type PedidoState = {
  id: string;
  items: ItemState[];
  /** Bandera de revisión activa (tarea "SURTIDO Y REVISIÓN PEDIDO CLIENTE"). */
  banderaRevision: boolean;
  finalizado: boolean;
};

export type PedidoAction =
  | { type: 'surtir'; codigo: string; cantidad: number }
  | { type: 'fijarSurtido'; codigo: string; cantidad: number }
  | { type: 'revisar'; codigo: string; cantidad: number }
  | { type: 'completarRevision'; codigo: string }
  | { type: 'cancelarRevision'; codigo: string }
  | { type: 'negar'; codigo: string }
  | { type: 'negarPromocion'; codigos: string[] }
  | { type: 'finalizar' }
  | { type: 'reiniciar'; estado?: PedidoState };

export function estadoInicial(): PedidoState {
  return {
    id: PEDIDO_ID,
    banderaRevision: true,
    finalizado: false,
    items: PRODUCTOS.map((p) => ({ codigo: p.codigo, surtido: 0, revisado: 0, revisionCompleta: false, negado: false })),
  };
}

export const producto = (codigo: string): ProductoPedido | undefined => PRODUCTOS.find((p) => p.codigo === codigo);

/** Total de artículos (piezas) surtidas del pedido (excluye negados). */
export function totalArticulos(s: PedidoState): number {
  return s.items.reduce((n, i) => n + (i.negado ? 0 : i.surtido), 0);
}

export function statusDe(item: ItemState): OrderItemStatus {
  if (item.negado) return 'negado';
  const p = producto(item.codigo)!;
  if (item.surtido <= 0) return 'no-iniciado';
  if (item.surtido < p.solicitado) return 'parcial';
  return 'completado';
}

export function tipoRevision(p: ProductoPedido): TipoRevision {
  return p.esMiscelaneo || p.multiploMayorQueEvento || p.costoUnitario < 100 ? 'simplificada' : 'forzosa';
}

export function conteos(s: PedidoState) {
  const c = { completado: 0, negado: 0, parcial: 0, pendientes: 0 };
  for (const it of s.items) {
    const st = statusDe(it);
    if (st === 'completado') c.completado++;
    else if (st === 'negado') c.negado++;
    else if (st === 'parcial') c.parcial++;
    else c.pendientes++;
  }
  return c;
}

/** Partidas con piezas surtidas pendientes de revisión, en el orden del pedido. */
export const pendientesDeRevision = (s: PedidoState) => s.items.filter((i) => !i.negado && i.surtido > 0 && !i.revisionCompleta);

/** Todo surtido (completado o negado) y todo lo surtido revisado → finalización automática (4582:20084, espera 3000 ms). */
export const listoParaFinalizar = (s: PedidoState) =>
  s.items.every((i) => i.negado || statusDe(i) === 'completado') && pendientesDeRevision(s).length === 0;

/** Promoción AxB incompleta: algún código negado mientras otro de la misma promoción se surtió. */
export function promocionIncompleta(s: PedidoState) {
  for (const promo of PROMOCIONES) {
    const its = s.items.filter((i) => promo.codigos.includes(i.codigo));
    if (its.some((i) => i.negado) && its.some((i) => !i.negado && i.surtido > 0)) return promo;
  }
  return null;
}

function actualizar(s: PedidoState, codigo: string, f: (i: ItemState) => ItemState): PedidoState {
  return { ...s, items: s.items.map((i) => (i.codigo === codigo ? f(i) : i)) };
}

function conSurtido(i: ItemState, cantidad: number): ItemState {
  const p = producto(i.codigo)!;
  const surtido = Math.max(0, Math.min(p.solicitado, cantidad));
  if (surtido === i.surtido) return i;
  // Cambió la cantidad surtida → la revisión se restablece (sección 3168:15884)
  return { ...i, surtido, negado: false, revisado: 0, revisionCompleta: false };
}

export function pedidoReducer(s: PedidoState, a: PedidoAction): PedidoState {
  switch (a.type) {
    case 'surtir':
      return actualizar(s, a.codigo, (i) => conSurtido(i, i.surtido + a.cantidad));
    case 'fijarSurtido':
      return actualizar(s, a.codigo, (i) => conSurtido(i, a.cantidad));
    case 'revisar':
      return actualizar(s, a.codigo, (i) => {
        const revisado = Math.min(i.surtido, i.revisado + a.cantidad);
        return { ...i, revisado, revisionCompleta: revisado >= i.surtido && i.surtido > 0 };
      });
    case 'completarRevision':
      return actualizar(s, a.codigo, (i) => ({ ...i, revisado: i.surtido, revisionCompleta: true }));
    case 'cancelarRevision':
      return actualizar(s, a.codigo, (i) => (i.revisionCompleta ? i : { ...i, revisado: 0 }));
    case 'negar':
      return actualizar(s, a.codigo, (i) => ({ ...i, negado: true, surtido: 0, revisado: 0, revisionCompleta: false }));
    case 'negarPromocion':
      return { ...s, items: s.items.map((i) => (a.codigos.includes(i.codigo) ? { ...i, negado: true, surtido: 0, revisado: 0, revisionCompleta: false } : i)) };
    case 'finalizar':
      return { ...s, finalizado: true };
    case 'reiniciar':
      return a.estado ?? estadoInicial();
  }
}
