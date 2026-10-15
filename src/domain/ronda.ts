/**
 * Surtido multipedido: ronda de hasta 3 pedidos, cada uno con su contenedor (A, B, C).
 * Sin respaldo en Figma (2888:9537 está vacía); reglas de la propuesta en docs/figma/flujos-surtido.md, sección "Multipedido".
 *
 * Regla de reparto: al escanear piezas de un código se llenan primero los pedidos capturados antes. Así, si al final
 * faltan piezas, el faltante cae en el pedido más reciente.
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
};

export type RondaAction =
  | { type: 'recolectar'; codigo: string; cantidad: number }
  | { type: 'separar'; codigo: string; asignaciones: Asignacion[] }
  | { type: 'terminarRecoleccion' }
  | { type: 'finalizar' };

export function rondaInicial(propuesta: PropuestaRonda = 'A'): RondaState {
  return { propuesta, fase: 'surtido', recolectado: {}, separado: Object.fromEntries(PEDIDOS_RONDA.map((p) => [p.id, {}])) };
}

export const productoRonda = (codigo: string) => CATALOGO_RONDA.find((p) => p.codigo === codigo);

const solicitadoDe = (p: PedidoRonda, codigo: string) => p.partidas.find((x) => x.codigo === codigo)?.solicitado ?? 0;
const separadoDe = (s: RondaState, pedido: string, codigo: string) => s.separado[pedido]?.[codigo] ?? 0;
const pendienteDe = (s: RondaState, p: PedidoRonda, codigo: string) => solicitadoDe(p, codigo) - separadoDe(s, p.id, codigo);

/** ¿La propuesta separa al escanear en esta fase? (A y B siempre; C solo en la revisión.) */
export const separaAlEscanear = (s: RondaState) => s.propuesta !== 'C' || s.fase === 'separacion';

export type LineaConsolidada = {
  codigo: string;
  total: number;
  /** Piezas ya contadas: separadas (A, B, C en revisión) o recolectadas (C en surtido). */
  avance: number;
  porPedido: { pedido: string; contenedor: Contenedor; solicitado: number; separado: number }[];
};

/** Lista consolidada en orden de recorrido (orden del catálogo = orden por ubicación). */
export function consolidado(s: RondaState): LineaConsolidada[] {
  return CATALOGO_RONDA.flatMap((prod) => {
    const porPedido = PEDIDOS_RONDA.filter((p) => solicitadoDe(p, prod.codigo) > 0).map((p) => ({
      pedido: p.id,
      contenedor: p.contenedor,
      solicitado: solicitadoDe(p, prod.codigo),
      separado: separadoDe(s, p.id, prod.codigo),
    }));
    if (!porPedido.length) return [];
    const total = porPedido.reduce((n, x) => n + x.solicitado, 0);
    const separado = porPedido.reduce((n, x) => n + x.separado, 0);
    const avance = separaAlEscanear(s) ? separado : (s.recolectado[prod.codigo] ?? 0);
    return [{ codigo: prod.codigo, total, avance, porPedido }];
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
    const solicitado = p.partidas.reduce((n, x) => n + x.solicitado, 0);
    const separado = p.partidas.reduce((n, x) => n + separadoDe(s, p.id, x.codigo), 0);
    return { pedido: p, separado, solicitado, completo: separado >= solicitado };
  });
}

/** Avance de la ronda (15:1455) por código consolidado: completo, parcial o pendiente. En la ronda no se niega. */
export function conteosRonda(s: RondaState) {
  const c = { completado: 0, negado: 0, parcial: 0, pendientes: 0 };
  for (const l of consolidado(s)) {
    if (l.avance >= l.total) c.completado++;
    else if (l.avance > 0) c.parcial++;
    else c.pendientes++;
  }
  return c;
}

/** Faltantes por pedido (lo que quedaría sin surtir si se finaliza ahora). */
export function faltantes(s: RondaState) {
  return PEDIDOS_RONDA.map((p) => ({
    pedido: p,
    partidas: p.partidas
      .map((x) => ({ codigo: x.codigo, faltan: pendienteDe(s, p, x.codigo), solicitado: x.solicitado }))
      .filter((x) => x.faltan > 0),
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
      return { ...s, recolectado: { ...s.recolectado, [a.codigo]: Math.min(total, actual + a.cantidad) } };
    }
    case 'separar': {
      const separado = { ...s.separado };
      for (const x of a.asignaciones) {
        separado[x.pedido] = { ...separado[x.pedido], [a.codigo]: separadoDe(s, x.pedido, a.codigo) + x.cantidad };
      }
      return { ...s, separado };
    }
    case 'terminarRecoleccion':
      return { ...s, fase: 'separacion' };
    case 'finalizar':
      return { ...s, fase: 'finalizada' };
  }
}
