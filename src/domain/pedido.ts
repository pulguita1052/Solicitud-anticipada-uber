/**
 * Estado del traspaso durante el surtido (📲 Surtido - Un pedido x ronda, 24:16) + rechazo completo del traspaso
 * (❌ Negar totalidad traspaso, 6874:864). La revisión es una tarea aparte.
 * Reglas: prototipo de Figma (docs/figma/flujos-surtido.md) + flujo escrito por el usuario (2026-10-09 y 2026-10-12).
 */
import { CATALOGO, PARTIDAS, PEDIDO_ID, type ProductoCatalogo, type Propuesta } from '../mocks/pedido';
import type { OrderItemStatus } from '../design-system/components/molecules/OrderItemRow/OrderItemRow';

export type ItemState = {
  codigo: string;
  solicitado: number;
  surtido: number;
  /** Ya se escaneó la etiqueta (o el código) del producto: habilita editar la cantidad en el Detalle (sticky note 325:3051). */
  escaneado: boolean;
  negado: boolean;
  motivoNegado?: string;
};

export type PedidoState = {
  id: string;
  /** Propuesta de flujo para rechazar el traspaso (7020:21322 / 7053:26344). */
  propuesta: Propuesta;
  items: ItemState[];
  finalizado: boolean;
  /** Motivo con el que se rechazó el traspaso completo; si existe, el traspaso quedó rechazado. */
  motivoRechazo?: string;
};

export type PedidoAction =
  | { type: 'surtir'; codigo: string; cantidad: number }
  | { type: 'fijarSurtido'; codigo: string; cantidad: number }
  | { type: 'negar'; codigo: string; motivo: string }
  | { type: 'finalizar' }
  | { type: 'rechazar'; motivo: string }
  | { type: 'reiniciar'; estado?: PedidoState };

export function estadoInicial(propuesta: Propuesta = 1): PedidoState {
  return {
    id: PEDIDO_ID,
    propuesta,
    finalizado: false,
    items: PARTIDAS[propuesta].map((p) => ({ codigo: p.codigo, solicitado: p.solicitado, surtido: 0, escaneado: false, negado: false })),
  };
}

export const producto = (codigo: string): ProductoCatalogo | undefined => CATALOGO.find((p) => p.codigo === codigo);

export function statusDe(item: ItemState): OrderItemStatus {
  if (item.negado) return 'negado';
  if (item.surtido <= 0) return 'no-iniciado';
  if (item.surtido < item.solicitado) return 'parcial';
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

/** Propuesta #1: "Rechazar traspaso" solo aparece mientras todos los productos sigan en 0 (7020:25441). */
export const sinPiezasSurtidas = (s: PedidoState) => s.items.every((i) => i.surtido === 0);

function actualizar(s: PedidoState, codigo: string, f: (i: ItemState) => ItemState): PedidoState {
  return { ...s, items: s.items.map((i) => (i.codigo === codigo ? f(i) : i)) };
}

function conSurtido(i: ItemState, cantidad: number): ItemState {
  return { ...i, surtido: Math.max(0, Math.min(i.solicitado, cantidad)) };
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
    case 'rechazar':
      // Propuesta #2: las piezas ya surtidas se marcan como rechazadas junto con el traspaso (7053:26522).
      return { ...s, finalizado: true, motivoRechazo: a.motivo };
    case 'reiniciar':
      return a.estado ?? estadoInicial(s.propuesta);
  }
}
