/**
 * Escenarios de verificación visual: ?escenario=<id> siembra el estado del pedido para reproducir un frame de Figma.
 * Los usa tests/visual (F6) y sirven para revisar pantallas sin recorrer todo el flujo.
 */
import { estadoInicial, type ItemState, type PedidoState } from '../domain/pedido';
import type { Semilla } from '../store/AppStore';

type Parcial = Partial<Omit<ItemState, 'codigo'>>;

function pedidoCon(cambios: Record<string, Parcial>): PedidoState {
  const s = estadoInicial();
  return { ...s, items: s.items.map((i) => ({ ...i, ...(cambios[i.codigo] ?? {}) })) };
}

/** Pedido con las 2 partidas surtidas + revisadas + finalizado (15 piezas, $4,000). Base para escenarios avanzados. */
const PEDIDO_COMPLETO: PedidoState = {
  ...pedidoCon({
    '1394000': { surtido: 10, revisado: 10, revisionCompleta: true },
    '2546000': { surtido: 5, revisado: 5, revisionCompleta: true },
  }),
  finalizado: true,
};

export const ESCENARIOS: Record<string, Semilla> = {
  /* ───────── Menú y tareas ───────── */
  inicial: {},
  'tareas-surtido': { etapa: 'surtido' },
  'tareas-unificado': { etapa: 'surtido-unificado', pedido: PEDIDO_COMPLETO },
  'tareas-facturacion': { etapa: 'facturacion', pedido: PEDIDO_COMPLETO },

  /* ───────── Surtido / Revisión ───────── */
  // 1394000 (CINTA, misceláneo) surtido completo 10/10
  'surtido-1394000': { pedido: pedidoCon({ '1394000': { surtido: 10, revisado: 10, revisionCompleta: true } }) },
  // 3089:13509 — 2546000 parcial 3 de 5
  'parcial-2546000': { pedido: pedidoCon({ '2546000': { surtido: 3 } }) },
  // 3095:16325 — 2546000 parcial revisado
  'parcial-2546000-revisado': { pedido: pedidoCon({ '2546000': { surtido: 3, revisado: 3, revisionCompleta: true } }) },
};

export function semillaDesdeUrl(): Semilla | undefined {
  const id = new URLSearchParams(window.location.search).get('escenario');
  return id ? ESCENARIOS[id] : undefined;
}
