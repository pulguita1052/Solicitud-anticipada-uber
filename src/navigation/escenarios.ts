/**
 * Escenarios de verificación visual: ?escenario=<id> siembra el estado del traspaso para reproducir un frame de Figma.
 * Los usa tests/visual (F6) y sirven para revisar pantallas sin recorrer todo el flujo.
 * Cada escenario fija la propuesta de rechazo (❌ Negar totalidad traspaso: #1 7020:21322 · #2 7053:26344).
 */
import { estadoInicial, type ItemState, type PedidoState } from '../domain/pedido';
import type { Propuesta } from '../mocks/pedido';
import type { Semilla } from '../store/AppStore';

type Parcial = Partial<Omit<ItemState, 'codigo'>>;

function pedidoCon(propuesta: Propuesta, cambios: Record<string, Parcial>): PedidoState {
  const s = estadoInicial(propuesta);
  return { ...s, items: s.items.map((i) => ({ ...i, ...(cambios[i.codigo] ?? {}) })) };
}

const rechazado = (propuesta: Propuesta): Semilla => ({
  propuesta,
  etapa: 'rechazado',
  pedido: { ...estadoInicial(propuesta), finalizado: true, motivoRechazo: 'Traspaso duplicado' },
  toast: { kind: 'success', title: 'Traspaso rechazado', message: 'Se negó el surtido del traspaso correctamente.' },
});

export const ESCENARIOS: Record<string, Semilla> = {
  inicial: {},

  /* ───────── Propuesta #1 ───────── */
  'p1-tareas': { propuesta: 1 }, // 7020:21323
  'p1-inicio': { propuesta: 1 }, // 7020:22451 — todo en 0: el menú ofrece "Rechazar traspaso" (7020:25441)
  // Con piezas surtidas el menú vuelve al de siempre (182:9267): sin "Rechazar traspaso" y con "Finalizar surtido" activo
  'p1-con-surtido': { propuesta: 1, pedido: pedidoCon(1, { '0486600': { surtido: 4, escaneado: true } }) },
  'p1-rechazado': rechazado(1), // 7114:10987 + toast 7114:11110

  /* ───────── Propuesta #2 ───────── */
  'p2-tareas': { propuesta: 2 }, // 7053:26774
  'p2-inicio': { propuesta: 2 }, // 7053:26345
  'p2-parcial': { propuesta: 2, pedido: pedidoCon(2, { '0486600': { surtido: 1, escaneado: true } }) }, // 7053:27466
  'p2-rechazado': rechazado(2),
};

export function semillaDesdeUrl(): Semilla | undefined {
  const id = new URLSearchParams(window.location.search).get('escenario');
  return id ? ESCENARIOS[id] : undefined;
}
