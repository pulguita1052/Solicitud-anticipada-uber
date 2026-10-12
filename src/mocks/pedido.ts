/**
 * Datos simulados del traspaso. Fuente: ❌ Negar totalidad traspaso (6874:864).
 *   Propuesta #1 (7020:21322): 4 productos — Surtido de órdenes 7020:22451.
 *   Propuesta #2 (7053:26344): 2 productos — Surtido de órdenes 7053:26345.
 * Detalle de 1394001 (descripción, existencia y foto) de 📲 Surtido - Un pedido x ronda (131:6465).
 * Nombres de campos alineados al modelo legado (docs/tecnico/referencias.md §3).
 */
import foto1394001 from '@assets/images/producto-1394001.jpg';

export type Propuesta = 1 | 2;

export type ProductoCatalogo = {
  codigo: string;
  descripcion: string;
  foto?: string;
  /** Ubicación mostrada en la fila: Planta | Pasillo | Torre | Nivel */
  ubicacion: [string, string, string, string];
  /** Valores del bloque de Detalle de producto */
  planta: string;
  pasillo: string;
  torre: string;
  nivel: string;
  existencia: number;
  /** Precio unitario de venta (solo para el panel de productos de la demo). */
  precioUnitario: number;
};

function ubicado(torre: string, nivel: string) {
  return {
    ubicacion: ['Planta baja', 'Pasillo 18', `Torre ${torre}`, `Nivel ${nivel}`] as ProductoCatalogo['ubicacion'],
    planta: 'Planta baja',
    pasillo: '18',
    torre,
    nivel,
  };
}

/**
 * Ubicaciones de las filas de 7020:22451. PENDIENTE: Figma solo tiene el detalle de 1394001; la descripción,
 * existencia y precio de 0486600, 1365800 y 2389475 son datos de demo (no tienen foto).
 */
export const CATALOGO: ProductoCatalogo[] = [
  {
    ...ubicado('4', '1'),
    codigo: '0486600',
    descripcion: 'BALATA DELANTERA CERAMICA TSURU III 92-17 FRITEC 1 JGO',
    existencia: 25,
    precioUnitario: 420,
  },
  {
    ...ubicado('5', '1'),
    codigo: '1365800',
    descripcion: 'FOCO HALOGENO H4 12V 60/55W TIPO ORIGINAL TUNGSRAM 1 PZ',
    existencia: 12,
    precioUnitario: 95,
  },
  {
    ...ubicado('5', '1'),
    codigo: '1394001',
    descripcion: 'CINTA AISLANTE AMARILLO 20 PIES PLASTICA AMARILLA IMPORTADO 20 U/L', // 131:6465
    foto: foto1394001,
    existencia: 100, // 131:6465
    precioUnitario: 38,
  },
  {
    ...ubicado('4', '2'),
    codigo: '2389475',
    descripcion: 'FILTRO DE ACEITE PARA MOTOR NISSAN 1.6L INTERFIL 1 PZ',
    existencia: 20,
    precioUnitario: 110,
  },
];

export type PartidaTraspaso = { codigo: string; solicitado: number };

/** Partidas del traspaso por propuesta (cantidades de las filas "0 de N"). */
export const PARTIDAS: Record<Propuesta, PartidaTraspaso[]> = {
  1: [
    { codigo: '0486600', solicitado: 11 },
    { codigo: '1365800', solicitado: 7 },
    { codigo: '1394001', solicitado: 10 },
    { codigo: '2389475', solicitado: 8 },
  ],
  2: [
    { codigo: '0486600', solicitado: 2 },
    { codigo: '1365800', solicitado: 1 },
  ],
};

export const PEDIDO_ID = '123456';

/** Datos del modal "Rechazar traspaso" (7020:25766 / 7053:26522). */
export const TRASPASO = { sucursalDestino: 'Federalismo', peticion: '#1077896', tipo: 'Automática SMC' };

export const EMPLEADO = { id: '9029', nombre: 'JUAN ANTONIO GUERRERO MEDINA' };

export type Tarea = { actividad: string; documentoLabel: string; documento: string; fecha: string; hora: string };

export const TAREAS: Record<'surtido' | 'revision' | 'siguiente', Tarea> = {
  /** 7020:21323 / 7053:26774 */
  surtido: { actividad: 'SURTIR TRASPASO', documentoLabel: 'PedidoID', documento: PEDIDO_ID, fecha: '31/08/2023', hora: '11:30 a.m.' },
  /** Siguiente tarea al finalizar el surtido (197:20499). Fuera del alcance de esta rama: no se puede aceptar. */
  revision: {
    actividad: 'REVISAR PEDIDO CLIENTE',
    documentoLabel: 'DocumentoID',
    documento: 'SURTIR PEDIDO CLIENTE',
    fecha: '31/08/2023',
    hora: '11:30 a.m.',
  },
  /**
   * Tarea que aparece tras rechazar el traspaso (7114:10987). Figma repite la misma tarea; por indicación del usuario
   * (2026-10-12) se muestra otra tarea de demo que no se puede tomar.
   */
  siguiente: { actividad: 'SURTIR TRASPASO', documentoLabel: 'PedidoID', documento: '123461', fecha: '31/08/2023', hora: '12:15 p.m.' },
};

/** Opciones del select "Selección de motivo negado" (1246:7590). PENDIENTE: Figma solo muestra "Sin existencia". */
export const MOTIVOS_NEGADO = ['Sin existencia'];

/**
 * Opciones del select "Seleccione el motivo de rechazo de traspaso" (7040:25916). Figma solo muestra un texto de
 * relleno; por indicación del usuario (2026-10-12) se usan motivos de demo. PENDIENTE: catálogo real.
 */
export const MOTIVOS_RECHAZO = [
  'Sin existencia en la sucursal',
  'Existencia comprometida en pedidos de clientes',
  'Mercancía dañada o en mal estado',
  'Traspaso duplicado',
  'Error en la captura del traspaso',
  'Sucursal destino sin capacidad de recepción',
  'Sin unidad de transporte disponible',
];
