/**
 * Datos simulados del surtido multipedido (ronda de hasta 3 pedidos). Sin respaldo en Figma: la página
 * 📲 Surtido - Multi. pedido x ronda (2888:9537) está vacía y el flujo se diseña primero en código (2026-10-14).
 *
 * Productos: descripción, existencia, precio y foto de 1394000 / 2546000 (mocks/pedido.ts) y de 0486600 / 1365800 /
 * 0245134 / 1394001 (proporcionados por el usuario en feature-rechazar-traspaso). Las ubicaciones son de demo,
 * repartidas en varios pasillos para que se note el orden de recorrido de la lista consolidada.
 */
import foto0245134 from '@assets/images/producto-0245134.jpg';
import foto0486600 from '@assets/images/producto-0486600.jpg';
import foto1365800 from '@assets/images/producto-1365800.jpg';
import foto1394000 from '@assets/images/producto-1394000.jpg';
import foto1394001 from '@assets/images/producto-1394001.jpg';
import foto2546000 from '@assets/images/producto-2546000.jpg';

/** A: lista consolidada + separación en mesa · B: batch pick a contenedores · C: separación en la revisión. */
export type PropuestaRonda = 'A' | 'B' | 'C';
export type Contenedor = 'A' | 'B' | 'C';

export type ProductoRonda = {
  codigo: string;
  descripcion: string;
  foto: string;
  /** Planta | Pasillo | Torre | Nivel */
  ubicacion: [string, string, string, string];
  existencia: number;
  precioUnitario: number;
};

const en = (pasillo: number, torre: number, nivel: number): ProductoRonda['ubicacion'] => [
  'Planta baja',
  `Pasillo ${pasillo}`,
  `Torre ${torre}`,
  `Nivel ${nivel}`,
];

/** Ubicaciones de demo en varios pasillos. La lista consolidada se ordena por código (domain/ronda.ts). */
export const CATALOGO_RONDA: ProductoRonda[] = [
  {
    codigo: '0486600',
    descripcion: 'CONECTOR BOMBA DE GASOLINA 4 HEMBRA PUNTAS CON ARNES CARAVAN VOYAGER MINI RAM T TECNOFUEL HK-000033',
    foto: foto0486600,
    ubicacion: en(12, 4, 1),
    existencia: 22,
    precioUnitario: 117.86,
  },
  {
    codigo: '1365800',
    descripcion: 'CILINDRO ENCENDIDO CADILLAC CHEVROLET GMC QBH DYNAMIC US-287L',
    foto: foto1365800,
    ubicacion: en(12, 5, 1),
    existencia: 10,
    precioUnitario: 331.78,
  },
  {
    codigo: '1394000',
    descripcion: 'CINTA AISLANTE NEGRO 60 PLASTICA VERZE 20 U/L',
    foto: foto1394000,
    ubicacion: en(18, 5, 1),
    existencia: 100,
    precioUnitario: 300,
  },
  {
    codigo: '1394001',
    descripcion: 'CINTA AISLANTE AMARILLO 20 PIES PLASTICA AMARILLA IMPORTADO 20 U/L',
    foto: foto1394001,
    ubicacion: en(18, 5, 2),
    existencia: 100,
    precioUnitario: 38,
  },
  {
    codigo: '2546000',
    descripcion: 'INTERRUPTOR LLAVE 11 TIPO UNIVERSAL CAMIONES 60-79 POLLAK 31',
    foto: foto2546000,
    ubicacion: en(21, 2, 3),
    existencia: 8,
    precioUnitario: 200,
  },
  {
    codigo: '0245134',
    descripcion: 'ANTICONGELANTE CONCENTRADO 3.785L AL 70% VERZE 0245106',
    foto: foto0245134,
    ubicacion: en(24, 1, 1),
    existencia: 13,
    precioUnitario: 171.55,
  },
];

export type PedidoRonda = {
  id: string;
  contenedor: Contenedor;
  /** Hora de captura: define la prioridad cuando faltan piezas (el más antiguo se llena primero). */
  capturado: string;
  /** Cliente del pedido. El sistema a veces divide una venta en varios pedidos del mismo cliente (D50). */
  cliente: { id: string; nombre: string };
  partidas: { codigo: string; solicitado: number }[];
};

/**
 * Tres pedidos chicos (2–3 códigos) con códigos compartidos: 1394000 (A y B) y 2546000 (A y C).
 * A y B son del mismo cliente (venta dividida en dos pedidos): el Detalle de la ronda lo marca con "Mismo cliente".
 * Nombre de RAUL IGNACIO LIMA GUTIERREZ tomado de 34:2 (Detalle de la ronda); los demás datos de cliente son de demo.
 */
export const PEDIDOS_RONDA: PedidoRonda[] = [
  {
    id: '123456',
    contenedor: 'A',
    capturado: '11:02 a.m.',
    cliente: { id: '536983', nombre: 'RAUL IGNACIO LIMA GUTIERREZ' },
    partidas: [
      { codigo: '1394000', solicitado: 4 },
      { codigo: '2546000', solicitado: 2 },
      { codigo: '0486600', solicitado: 1 },
    ],
  },
  {
    id: '123457',
    contenedor: 'B',
    capturado: '11:05 a.m.',
    cliente: { id: '536983', nombre: 'RAUL IGNACIO LIMA GUTIERREZ' },
    partidas: [
      { codigo: '1365800', solicitado: 3 },
      { codigo: '1394000', solicitado: 2 },
    ],
  },
  {
    id: '123458',
    contenedor: 'C',
    capturado: '11:09 a.m.',
    cliente: { id: '481207', nombre: 'MARIA FERNANDA LOPEZ RUIZ' },
    partidas: [
      { codigo: '2546000', solicitado: 1 },
      { codigo: '0245134', solicitado: 6 },
      { codigo: '1394001', solicitado: 2 },
    ],
  },
];

export type TareaRonda = { actividad: string; documentoLabel: string };

export const TAREAS_RONDA = {
  surtir: { actividad: 'SURTIR RONDA DE PEDIDOS', documentoLabel: 'Pedidos' },
  /** Propuesta C: la revisión separa las piezas en los contenedores. */
  revisarSeparar: { actividad: 'REVISAR Y SEPARAR RONDA', documentoLabel: 'Pedidos' },
  /** Propuestas A y B: cada contenedor sigue a su revisión normal. Fuera del alcance: no se puede aceptar. */
  revisar: { actividad: 'REVISAR PEDIDO CLIENTE', documentoLabel: 'Pedidos' },
  /** Propuesta C, tras revisar y separar. Fuera del alcance: no se puede aceptar. */
  facturar: { actividad: 'FACTURAR Y EMBARCAR PEDIDO', documentoLabel: 'Pedidos' },
} satisfies Record<string, TareaRonda>;
