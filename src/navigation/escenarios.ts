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

const EMBARQUE_DEFAULT = { numero: '147707', facturas: 2, fecha: '2026-09-17 15:48' };

export const ESCENARIOS: Record<string, Semilla> = {
  /* ───────── Menú y tareas ───────── */
  inicial: {},
  'tareas-surtido': { etapa: 'surtido' },
  'tareas-unificado': { etapa: 'surtido-unificado', pedido: PEDIDO_COMPLETO },
  // Tarea "EMBARCAR TRASPASO" (flujo de traspaso: sin factura)
  'tareas-traspaso': { etapa: 'traspaso', pedido: PEDIDO_COMPLETO },

  /* ───────── Surtido / Revisión ───────── */
  // 1394000 (CINTA, misceláneo) surtido completo 10/10
  'surtido-1394000': { pedido: pedidoCon({ '1394000': { surtido: 10, revisado: 10, revisionCompleta: true } }) },
  // 3089:13509 — 2546000 parcial 3 de 5
  'parcial-2546000': { pedido: pedidoCon({ '2546000': { surtido: 3 } }) },
  // 3095:16325 — 2546000 parcial revisado
  'parcial-2546000-revisado': { pedido: pedidoCon({ '2546000': { surtido: 3, revisado: 3, revisionCompleta: true } }) },

  /* ───────── Traspaso (sin factura) ───────── */
  // Datos del traspaso – antes de continuar a embarque
  traspaso: { etapa: 'traspaso', pedido: PEDIDO_COMPLETO },
  // Traspaso ya con embarque asignado → ofrece Uber si es candidato
  'traspaso-embarcado': {
    etapa: 'traspaso',
    pedido: PEDIDO_COMPLETO,
    factura: { embarque: EMBARQUE_DEFAULT },
  },
  // Formulario de Uber y confirmación para un traspaso (destino = sucursal; sin folio de factura)
  'traspaso-uber-formulario': { etapa: 'uber', pedido: PEDIDO_COMPLETO, factura: { embarque: EMBARQUE_DEFAULT } },
  'traspaso-uber-confirmada': { etapa: 'uber', pedido: PEDIDO_COMPLETO, factura: { embarque: EMBARQUE_DEFAULT } },

  /* ───────── Facturación ───────── */
  // Tarea "FACTURAR Y EMBARCAR PEDIDO" – formulario vacío
  facturacion: { etapa: 'facturacion', pedido: PEDIDO_COMPLETO },
  // Estado "facturada" con folio (Figma 6004:7618) – sin embarque
  'factura-facturada': { etapa: 'facturacion', pedido: PEDIDO_COMPLETO, factura: { folio: '1099204', copias: 1, direccionEntrega: 1 } },
  // Estado "facturada + embarcada" – ya con embarque asignado (final del flujo Facturación)
  'factura-embarcada': {
    etapa: 'facturacion',
    pedido: PEDIDO_COMPLETO,
    factura: { folio: '1099204', copias: 1, direccionEntrega: 1, embarque: EMBARQUE_DEFAULT },
  },
  // Error al generar factura – usar con `?generar=error` para forzar el fallo
  'factura-error': { etapa: 'facturacion', pedido: PEDIDO_COMPLETO },

  /* ───────── Embarque (modales sobre Datos factura) ───────── */
  // Modal "Nuevo embarque" (6157:13865) preabierto sobre la factura ya generada
  'embarque-nuevo': {
    etapa: 'facturacion',
    pedido: PEDIDO_COMPLETO,
    factura: { folio: '1099204', copias: 1, direccionEntrega: 1 },
  },
  // Modal "Embarque creado" (6157:14047) preabierto — al aceptar dispara Uber
  'embarque-creado': {
    etapa: 'facturacion',
    pedido: PEDIDO_COMPLETO,
    factura: { folio: '1099204', copias: 1, direccionEntrega: 1 },
  },
  // Modal "Agregar embarque" — elección entre nuevo o agregar a uno existente (6182:16269)
  'embarque-agregar': {
    etapa: 'facturacion',
    pedido: PEDIDO_COMPLETO,
    factura: { folio: '1099204', copias: 1, direccionEntrega: 1 },
  },

  /* ───────── Uber (ERB-53024) ───────── */
  /* Mismo estado embarcado + dirección 2 (Huerto 221) — la dirección tiene historial de solicitudes previas
     y dispara la precarga de nombre/teléfono/referencias/dpto. */
  'uber-con-historial': {
    etapa: 'uber',
    pedido: PEDIDO_COMPLETO,
    factura: { folio: '1099204', copias: 1, direccionEntrega: 2, embarque: EMBARQUE_DEFAULT },
  },
  /* Ofrecimiento default (dirección 1, sin historial) */
  'uber-embarcado': {
    etapa: 'uber',
    pedido: PEDIDO_COMPLETO,
    factura: { folio: '1099204', copias: 1, direccionEntrega: 1, embarque: EMBARQUE_DEFAULT },
  },
  /* Ofrecimiento + modal inferior de consolidación abierto (cliente 536983 ya tiene solicitud CREADA
     para Huerto 221 en ACTIVOS_POR_CLIENTE_DIRECCION). Usar con `?paso=consolidacion`. */
  'uber-consolidacion': {
    etapa: 'uber',
    pedido: PEDIDO_COMPLETO,
    factura: { folio: '1099204', copias: 1, direccionEntrega: 2, embarque: EMBARQUE_DEFAULT },
  },
  /* Formulario vacío (cliente sin historial). Va con `?paso=formulario`. */
  'uber-formulario-vacio': {
    etapa: 'uber',
    pedido: PEDIDO_COMPLETO,
    factura: { folio: '1099204', copias: 1, direccionEntrega: 1, embarque: EMBARQUE_DEFAULT },
  },
  /* Formulario con precarga (cliente 536983 + Huerto 221). Descripción del paquete siempre vacía. */
  'uber-formulario-lleno': {
    etapa: 'uber',
    pedido: PEDIDO_COMPLETO,
    factura: { folio: '1099204', copias: 1, direccionEntrega: 2, embarque: EMBARQUE_DEFAULT },
  },
  /* Pantalla final "Solicitud creada" */
  'uber-confirmada': {
    etapa: 'uber',
    pedido: PEDIDO_COMPLETO,
    factura: { folio: '1099204', copias: 1, direccionEntrega: 1, embarque: EMBARQUE_DEFAULT },
  },
};

export function semillaDesdeUrl(search: string = window.location.search): Semilla | undefined {
  const id = new URLSearchParams(search).get('escenario');
  return id ? ESCENARIOS[id] : undefined;
}
