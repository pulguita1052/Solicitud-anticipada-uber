/**
 * Surtido multipedido: ronda de hasta 3 pedidos, cada uno con su contenedor (A, B, C).
 * Sin respaldo en Figma (2888:9537 está vacía); reglas de la propuesta en docs/figma/flujos-surtido.md, sección "Multipedido".
 *
 * Regla de reparto: al escanear piezas de un código se llenan primero los pedidos capturados antes. Así, si al final
 * faltan piezas, el faltante cae en el pedido más reciente.
 * Negado por pedido (Detalle de producto de la ronda): solo pedidos con el producto en 0; un mismo motivo para todos. Una
 * partida negada deja de contar como solicitada (no recibe piezas ni queda como faltante).
 */
import { CATALOGO_RONDA, PEDIDOS_RONDA, type Contenedor, type PedidoRonda, type PropuestaRonda } from '../mocks/ronda';

export type FaseRonda = 'surtido' | 'separacion' | 'finalizada';

export type Asignacion = { pedido: string; contenedor: Contenedor; cantidad: number };

export type RondaState = {
  propuesta: PropuestaRonda;
  /** C: 'surtido' (solo recolecta) → 'separacion' (revisión) → 'finalizada'. A y B: 'surtido' → 'finalizada'. */
  fase: FaseRonda;
  /** Propuesta C, fase de surtido: piezas recolectadas por código, sin separar. */
  recolectado: Record<string, number>;
  /** Piezas colocadas en el contenedor de cada pedido: separado[pedido][codigo]. */
  separado: Record<string, Record<string, number>>;
  /** Partidas negadas por pedido con su motivo: negado[pedido][codigo] = motivo. */
  negado: Record<string, Record<string, string>>;
  /** Códigos escaneados al menos una vez (etiqueta de 18 dígitos o código de 7): habilita editar cantidades en el Detalle. */
  escaneado: Record<string, true>;
};

export type RondaAction =
  | { type: 'recolectar'; codigo: string; cantidad: number }
  | { type: 'separar'; codigo: string; asignaciones: Asignacion[] }
  /** Detalle de producto: cantidad surtida de un pedido editada con el spinner. */
  | { type: 'fijarSeparado'; pedido: string; codigo: string; cantidad: number }
  | { type: 'negar'; codigo: string; pedidos: string[]; motivo: string }
  | { type: 'terminarRecoleccion' }
  | { type: 'finalizar' };

export function rondaInicial(propuesta: PropuestaRonda = 'A'): RondaState {
  const porPedido = () => Object.fromEntries(PEDIDOS_RONDA.map((p) => [p.id, {}]));
  return { propuesta, fase: 'surtido', recolectado: {}, separado: porPedido(), negado: porPedido(), escaneado: {} };
}

export const productoRonda = (codigo: string) => CATALOGO_RONDA.find((p) => p.codigo === codigo);

const solicitadoDe = (p: PedidoRonda, codigo: string) => p.partidas.find((x) => x.codigo === codigo)?.solicitado ?? 0;
const separadoDe = (s: RondaState, pedido: string, codigo: string) => s.separado[pedido]?.[codigo] ?? 0;
/** ¿Ya se escaneó el código? (También cuenta si ya tiene piezas, p. ej. en los escenarios sembrados.) */
export const fueEscaneado = (s: RondaState, codigo: string) =>
  !!s.escaneado?.[codigo] || (s.recolectado[codigo] ?? 0) > 0 || PEDIDOS_RONDA.some((p) => separadoDe(s, p.id, codigo) > 0);

export const motivoNegado = (s: RondaState, pedido: string, codigo: string): string | undefined => s.negado?.[pedido]?.[codigo];
/** Lo que el pedido todavía pide de ese código: 0 si la partida está negada. */
const solicitadoEfectivo = (s: RondaState, p: PedidoRonda, codigo: string) => (motivoNegado(s, p.id, codigo) ? 0 : solicitadoDe(p, codigo));
const pendienteDe = (s: RondaState, p: PedidoRonda, codigo: string) => solicitadoEfectivo(s, p, codigo) - separadoDe(s, p.id, codigo);

/** ¿La propuesta separa al escanear en esta fase? (A y B siempre; C solo en la revisión.) */
export const separaAlEscanear = (s: RondaState) => s.propuesta !== 'C' || s.fase === 'separacion';

export type LineaConsolidada = {
  codigo: string;
  /** Piezas que pide la ronda sin contar partidas negadas. */
  total: number;
  /** Piezas ya contadas: separadas (A, B, C en revisión) o recolectadas (C en surtido). */
  avance: number;
  /** Todas las partidas del código están negadas. */
  negado: boolean;
  porPedido: { pedido: string; contenedor: Contenedor; solicitado: number; separado: number; motivoNegado?: string }[];
};

/** Catálogo ordenado por código de menor a mayor: así se muestra la lista consolidada (indicación del usuario, 2026-10-15). */
const POR_CODIGO = [...CATALOGO_RONDA].sort((a, b) => a.codigo.localeCompare(b.codigo));

/** Lista consolidada, ordenada por código de menor a mayor. */
export function consolidado(s: RondaState): LineaConsolidada[] {
  return POR_CODIGO.flatMap((prod) => {
    const porPedido = PEDIDOS_RONDA.filter((p) => solicitadoDe(p, prod.codigo) > 0).map((p) => ({
      pedido: p.id,
      contenedor: p.contenedor,
      solicitado: solicitadoDe(p, prod.codigo),
      separado: separadoDe(s, p.id, prod.codigo),
      motivoNegado: motivoNegado(s, p.id, prod.codigo),
    }));
    if (!porPedido.length) return [];
    const total = porPedido.reduce((n, x) => n + (x.motivoNegado ? 0 : x.solicitado), 0);
    const separado = porPedido.reduce((n, x) => n + x.separado, 0);
    const avance = separaAlEscanear(s) ? separado : (s.recolectado[prod.codigo] ?? 0);
    return [{ codigo: prod.codigo, total, avance, negado: porPedido.every((x) => x.motivoNegado), porPedido }];
  });
}

/**
 * Reparte `cantidad` piezas de `codigo` entre los pedidos que aún las necesitan, del más antiguo al más reciente.
 * En la propuesta C (revisión) no se puede separar más de lo recolectado.
 */
export function repartir(s: RondaState, codigo: string, cantidad: number): { asignaciones: Asignacion[]; sobrante: number } {
  let resto = cantidad;
  if (s.propuesta === 'C') {
    const separadoTotal = PEDIDOS_RONDA.reduce((n, p) => n + separadoDe(s, p.id, codigo), 0);
    resto = Math.min(resto, (s.recolectado[codigo] ?? 0) - separadoTotal);
  }
  const asignaciones: Asignacion[] = [];
  for (const p of PEDIDOS_RONDA) {
    const n = Math.min(resto, pendienteDe(s, p, codigo));
    if (n > 0) {
      asignaciones.push({ pedido: p.id, contenedor: p.contenedor, cantidad: n });
      resto -= n;
    }
  }
  const asignado = asignaciones.reduce((n, a) => n + a.cantidad, 0);
  return { asignaciones, sobrante: cantidad - asignado };
}

export type AvancePedido = { pedido: PedidoRonda; separado: number; solicitado: number; completo: boolean };

export function avancePedidos(s: RondaState): AvancePedido[] {
  return PEDIDOS_RONDA.map((p) => {
    const solicitado = p.partidas.reduce((n, x) => n + solicitadoEfectivo(s, p, x.codigo), 0);
    const separado = p.partidas.reduce((n, x) => n + separadoDe(s, p.id, x.codigo), 0);
    return { pedido: p, separado, solicitado, completo: separado >= solicitado };
  });
}

/** Avance de la ronda (15:1455) por código consolidado: negado (en todos sus pedidos), completo, parcial o pendiente. */
export function conteosRonda(s: RondaState) {
  const c = { completado: 0, negado: 0, parcial: 0, pendientes: 0 };
  for (const l of consolidado(s)) {
    if (l.negado) c.negado++;
    else if (l.avance >= l.total) c.completado++;
    else if (l.avance > 0) c.parcial++;
    else c.pendientes++;
  }
  return c;
}

export type GrupoMismoCliente = { cliente: PedidoRonda['cliente']; pedidos: PedidoRonda[] };

/**
 * Pedidos de la ronda que son del mismo cliente (venta dividida en varios pedidos; p. ej. un cable por metro pedido
 * como 20 m en un pedido y 1 m en otro, D50).
 */
export function mismosClientes(): GrupoMismoCliente[] {
  const porCliente = new Map<string, PedidoRonda[]>();
  for (const p of PEDIDOS_RONDA) porCliente.set(p.cliente.id, [...(porCliente.get(p.cliente.id) ?? []), p]);
  return [...porCliente.values()]
    .filter((ps) => ps.length > 1)
    .map((ps) => ({ cliente: ps[0].cliente, pedidos: ps }));
}

/** Faltantes por pedido (lo que quedaría sin surtir si se finaliza ahora). */
export function faltantes(s: RondaState) {
  return PEDIDOS_RONDA.map((p) => ({
    pedido: p,
    partidas: p.partidas
      .map((x) => ({ codigo: x.codigo, faltan: pendienteDe(s, p, x.codigo), solicitado: solicitadoEfectivo(s, p, x.codigo) }))
      .filter((x) => x.faltan > 0),
  })).filter((x) => x.partidas.length > 0);
}

/**
 * Partidas sin iniciar por pedido: el pedido aún las pide (no negadas) y no tienen ninguna pieza. Impiden finalizar la
 * ronda; hay que negarlas desde el Detalle de producto ("No es posible finalizar surtido", 190:10418).
 */
export function sinIniciar(s: RondaState) {
  return PEDIDOS_RONDA.map((p) => ({
    pedido: p,
    partidas: p.partidas
      .filter((x) => solicitadoEfectivo(s, p, x.codigo) > 0 && separadoDe(s, p.id, x.codigo) === 0)
      .map((x) => ({ codigo: x.codigo, solicitado: x.solicitado }))
      .sort((a, b) => a.codigo.localeCompare(b.codigo)),
  })).filter((x) => x.partidas.length > 0);
}

/** Propuesta C, fase de surtido: códigos con menos piezas recolectadas que el total de la ronda. */
export const faltantesRecoleccion = (s: RondaState) => consolidado(s).filter((l) => l.avance < l.total);

/** Todo listo para cerrar la fase actual (dispara el modal automático). */
export const rondaCompleta = (s: RondaState) => consolidado(s).every((l) => l.avance >= l.total);

export function rondaReducer(s: RondaState, a: RondaAction): RondaState {
  switch (a.type) {
    case 'recolectar': {
      const total = consolidado(s).find((l) => l.codigo === a.codigo)?.total ?? 0;
      const actual = s.recolectado[a.codigo] ?? 0;
      return {
        ...s,
        recolectado: { ...s.recolectado, [a.codigo]: Math.min(total, actual + a.cantidad) },
        escaneado: { ...s.escaneado, [a.codigo]: true },
      };
    }
    case 'separar': {
      const separado = { ...s.separado };
      for (const x of a.asignaciones) {
        separado[x.pedido] = { ...separado[x.pedido], [a.codigo]: separadoDe(s, x.pedido, a.codigo) + x.cantidad };
      }
      return { ...s, separado, escaneado: { ...s.escaneado, [a.codigo]: true } };
    }
    case 'fijarSeparado': {
      const p = PEDIDOS_RONDA.find((x) => x.id === a.pedido)!;
      const cantidad = Math.max(0, Math.min(solicitadoEfectivo(s, p, a.codigo), a.cantidad));
      return { ...s, separado: { ...s.separado, [a.pedido]: { ...s.separado[a.pedido], [a.codigo]: cantidad } } };
    }
    case 'negar': {
      const negado = { ...s.negado };
      // Solo se niega un pedido con el producto en 0 (regla del Detalle de producto de la ronda)
      for (const pedido of a.pedidos.filter((x) => separadoDe(s, x, a.codigo) === 0)) {
        negado[pedido] = { ...negado[pedido], [a.codigo]: a.motivo };
      }
      return { ...s, negado };
    }
    case 'terminarRecoleccion':
      return { ...s, fase: 'separacion' };
    case 'finalizar':
      return { ...s, fase: 'finalizada' };
  }
}
