/**
 * Escenarios de verificación visual: ?escenario=<id> siembra el estado del pedido para reproducir un frame de Figma.
 * Los usa tests/visual (F6) y sirven para revisar pantallas sin recorrer todo el flujo.
 */
import { estadoInicial, type ItemState, type PedidoState } from '../domain/pedido';
import { rondaInicial, type FaseRonda, type RondaState } from '../domain/ronda';
import type { PropuestaRonda } from '../mocks/ronda';
import type { Semilla } from '../store/AppStore';

type Parcial = Partial<Omit<ItemState, 'codigo'>>;

function pedidoCon(cambios: Record<string, Parcial>): PedidoState {
  const s = estadoInicial();
  return { ...s, items: s.items.map((i) => ({ ...i, ...(cambios[i.codigo] ?? {}) })) };
}

function rondaCon(
  propuesta: PropuestaRonda,
  cambios: { fase?: FaseRonda; separado?: RondaState['separado']; recolectado?: RondaState['recolectado'] } = {},
): RondaState {
  const r = rondaInicial(propuesta);
  return { ...r, ...cambios, separado: { ...r.separado, ...cambios.separado } };
}

/** Ronda a medias: el pedido A ya está completo, B a la mitad y C sin empezar. */
const SEPARADO_EN_CURSO: RondaState['separado'] = {
  '123456': { '1394000': 4, '2546000': 2, '0486600': 1 },
  '123457': { '1394000': 2, '1365800': 1 },
};

/** Recolección completa de la propuesta C excepto 0245134 (4 de 6): el faltante cae en el pedido C. */
const RECOLECTADO_C = { '0486600': 1, '1365800': 3, '1394000': 6, '1394001': 2, '2546000': 3, '0245134': 4 };

export const ESCENARIOS: Record<string, Semilla> = {
  /* ───────── Multipedido (sin Figma) ───────── */
  'ronda-a': { etapa: 'ronda-surtido', ronda: rondaCon('A') },
  'ronda-a-detalle': { etapa: 'ronda-surtido', ronda: rondaCon('A') },
  'ronda-a-en-curso': { etapa: 'ronda-surtido', ronda: rondaCon('A', { separado: SEPARADO_EN_CURSO }) },
  'ronda-b': { etapa: 'ronda-surtido', ronda: rondaCon('B') },
  'ronda-b-en-curso': { etapa: 'ronda-surtido', ronda: rondaCon('B', { separado: SEPARADO_EN_CURSO }) },
  'ronda-c': { etapa: 'ronda-surtido', ronda: rondaCon('C') },
  'ronda-c-revision': { etapa: 'ronda-revision', ronda: rondaCon('C', { fase: 'separacion', recolectado: RECOLECTADO_C }) },

  /* ───────── Un pedido por ronda (📲 Surtido - Un pedido x ronda) ───────── */
  inicial: { etapa: 'surtido' },
  'tareas-surtido': { etapa: 'surtido' },
  // 197:20499 — tras finalizar el surtido, la siguiente tarea es REVISAR PEDIDO CLIENTE (bloqueada en esta rama)
  'tareas-revision': {
    etapa: 'revision',
    pedido: { ...pedidoCon({ '1394000': { surtido: 10, escaneado: true }, '2546000': { surtido: 5, escaneado: true } }), finalizado: true },
  },

  /* ───────── Surtido ───────── */
  // 2546000 parcial 3 de 5 → al finalizar aparece el modal de códigos parciales (182:9894)
  'parcial-2546000': { etapa: 'surtido', pedido: pedidoCon({ '1394000': { surtido: 10, escaneado: true }, '2546000': { surtido: 3, escaneado: true } }) },
  // 1394000 completo y 2546000 sin surtir → "No es posible finalizar surtido" (190:10418); negarlo desde el Detalle
  'sin-surtir-2546000': { etapa: 'surtido', pedido: pedidoCon({ '1394000': { surtido: 10, escaneado: true } }) },
  // 1394000 completo + 2546000 negado → finalización automática (197:22893)
  'completo-con-negado': {
    etapa: 'surtido',
    pedido: pedidoCon({ '1394000': { surtido: 10, escaneado: true }, '2546000': { negado: true, motivoNegado: 'Sin existencia' } }),
  },
};

export function semillaDesdeUrl(): Semilla | undefined {
  const id = new URLSearchParams(window.location.search).get('escenario');
  return id ? ESCENARIOS[id] : undefined;
}
