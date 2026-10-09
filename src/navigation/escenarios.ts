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

export const ESCENARIOS: Record<string, Semilla> = {
  /* ───────── Menú y tareas ───────── */
  inicial: {},
  'tareas-surtido': { etapa: 'surtido' },
  // 197:20499 — tras finalizar el surtido, la siguiente tarea es REVISAR PEDIDO CLIENTE (bloqueada en esta rama)
  'tareas-revision': {
    etapa: 'revision',
    pedido: { ...pedidoCon({ '1394000': { surtido: 10, escaneado: true }, '2546000': { surtido: 5, escaneado: true } }), finalizado: true },
  },

  /* ───────── Surtido ───────── */
  // 2546000 parcial 3 de 5 → al finalizar aparece el modal de códigos parciales (182:9894)
  'parcial-2546000': { pedido: pedidoCon({ '1394000': { surtido: 10, escaneado: true }, '2546000': { surtido: 3, escaneado: true } }) },
  // 1394000 completo y 2546000 sin surtir → "No es posible finalizar surtido" (190:10418); negarlo desde el Detalle
  'sin-surtir-2546000': { pedido: pedidoCon({ '1394000': { surtido: 10, escaneado: true } }) },
  // 1394000 completo + 2546000 negado → finalización automática (197:22893)
  'completo-con-negado': {
    pedido: pedidoCon({ '1394000': { surtido: 10, escaneado: true }, '2546000': { negado: true, motivoNegado: 'Sin existencia' } }),
  },
};

export function semillaDesdeUrl(): Semilla | undefined {
  const id = new URLSearchParams(window.location.search).get('escenario');
  return id ? ESCENARIOS[id] : undefined;
}
