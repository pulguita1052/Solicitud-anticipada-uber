/**
 * Estado del pedido durante el surtido (📲 Surtido - Un pedido x ronda, 24:16). La revisión es una tarea aparte.
 * Reglas: prototipo de Figma (docs/figma/flujos-surtido.md) + flujo escrito por el usuario (2026-10-09).
 */
import { PEDIDO_ID, PRODUCTOS, type ProductoPedido } from '../mocks/pedido';
import type { OrderItemStatus } from '../design-system/components/molecules/OrderItemRow/OrderItemRow';

export type ItemState = {
  codigo: string;
  surtido: number;
  /** Ya se escaneó la etiqueta (o el código) del producto: habilita editar la cantidad en el Detalle (sticky note 325:3051). */
  escaneado: boolean;
  negado: boolean;
  motivoNegado?: string;
};

export type PedidoState = {
  id: string;
  items: ItemState[];
  finalizado: boolean;
};

export type PedidoAction =
  | { type: 'surtir'; codigo: string; cantidad: number }
  | { type: 'fijarSurtido'; codigo: string; cantidad: number }
  | { type: 'negar'; codigo: string; motivo: string }
  | { type: 'finalizar' }
  | { type: 'reiniciar'; estado?: PedidoState };

export function estadoInicial(): PedidoState {
  return {
    id: PEDIDO_ID,
    finalizado: false,
    items: PRODUCTOS.map((p) => ({ codigo: p.codigo, surtido: 0, escaneado: false, negado: false })),
  };
}

export const producto = (codigo: string): ProductoPedido | undefined => PRODUCTOS.find((p) => p.codigo === codigo);

export function statusDe(item: ItemState): OrderItemStatus {
  if (item.negado) return 'negado';
  const p = producto(item.codigo)!;
  if (item.surtido <= 0) return 'no-iniciado';
  if (item.surtido < p.solicitado) return 'parcial';
  return 'completado';
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

/** Partidas sin surtir (surtido 0 y no negadas): impiden finalizar (190:10418). */
export const sinSurtir = (s: PedidoState) => s.items.filter((i) => statusDe(i) === 'no-iniciado');

/** Partidas con 0 < surtido < solicitado: modal informativo antes de finalizar (182:9894). */
export const parciales = (s: PedidoState) => s.items.filter((i) => statusDe(i) === 'parcial');

/** Todo surtido completo o negado → finalización automática (197:22719 → 600 ms → 197:22893). */
export const listoParaFinalizar = (s: PedidoState) => s.items.every((i) => i.negado || statusDe(i) === 'completado');

function actualizar(s: PedidoState, codigo: string, f: (i: ItemState) => ItemState): PedidoState {
  return { ...s, items: s.items.map((i) => (i.codigo === codigo ? f(i) : i)) };
}

function conSurtido(i: ItemState, cantidad: number): ItemState {
  const p = producto(i.codigo)!;
  return { ...i, surtido: Math.max(0, Math.min(p.solicitado, cantidad)) };
}

export function pedidoReducer(s: PedidoState, a: PedidoAction): PedidoState {
  switch (a.type) {
    case 'surtir':
      return actualizar(s, a.codigo, (i) => ({ ...conSurtido(i, i.surtido + a.cantidad), escaneado: true }));
    case 'fijarSurtido':
      return actualizar(s, a.codigo, (i) => conSurtido(i, a.cantidad));
    case 'negar':
      return actualizar(s, a.codigo, (i) => ({ ...i, negado: true, surtido: 0, motivoNegado: a.motivo }));
    case 'finalizar':
      return { ...s, finalizado: true };
    case 'reiniciar':
      return a.estado ?? estadoInicial();
  }
}
