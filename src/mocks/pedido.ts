/**
 * Datos simulados del pedido. Textos y cantidades tomados literalmente de Figma
 * (🔎 Revisión - Durante el surtido, frames 3048:10138, 3091:14568, 3316:18734, 3126:14858, 3062:12611).
 * Nombres de campos alineados al modelo legado (docs/tecnico/referencias.md §3).
 */
import foto1394000 from '@assets/images/producto-1394000.jpg';
import foto2546000 from '@assets/images/producto-2546000.jpg';
import { TRASPASO } from './traspaso';

export type TipoRevision = 'forzosa' | 'simplificada';

export type ProductoPedido = {
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
  solicitado: number;
  /**
   * Reglas de revisión (rombos de 3048:10013): misceláneo, múltiplo de empaque > cantidad por evento
   * o costo unitario < $100 → revisión simplificada; si no, escaneo forzoso.
   */
  esMiscelaneo: boolean;
  multiploMayorQueEvento: boolean;
  costoUnitario: number;
  /** Precio unitario de venta (para calcular el monto del pedido en el ofrecimiento de Uber). */
  precioUnitario: number;
};

const ubicacion: ProductoPedido['ubicacion'] = ['Planta baja', 'Pasillo 18', 'Torre 5', 'Nivel 1'];
const base = { ubicacion, planta: 'Planta baja', pasillo: '18', torre: '5', nivel: '1' };

export const PEDIDO_ID = '123456';

/**
 * Pedido reducido a 2 productos para simplificar la demo. Total del pedido = $4,000
 * (10 × $300 + 5 × $200). Con `REGLAS_UBER.montoMinimo = $300` cualquiera de los dos
 * productos individualmente sigue por encima del mínimo, así que el pedido se mantiene
 * candidato aunque el operador niegue una partida.
 */
export const PRODUCTOS: ProductoPedido[] = [
  {
    ...base,
    codigo: '1394000',
    descripcion: 'CINTA AISLANTE NEGRO 60 PLASTICA VERZE 20 U/L',
    foto: foto1394000,
    existencia: 8, // PENDIENTE: Figma no muestra la existencia de 1394000
    solicitado: 10,
    esMiscelaneo: true, // revisión simplificada en 3316:18734
    multiploMayorQueEvento: false,
    costoUnitario: 0,
    precioUnitario: 300, // 10 × $300 = $3,000
  },
  {
    ...base,
    codigo: '2546000',
    descripcion: 'INTERRUPTOR LLAVE 11 TIPO UNIVERSAL CAMIONES 60-79 POLLAK 31',
    foto: foto2546000,
    existencia: 8,
    solicitado: 5,
    esMiscelaneo: false, // escaneo forzoso en 3091:15591
    multiploMayorQueEvento: false,
    costoUnitario: 100,
    precioUnitario: 200, // 5 × $200 = $1,000
  },
];

/** Promoción AxB — deshabilitada al reducir el pedido; se restablece si se vuelven a agregar los productos que participaban. */
export const PROMOCIONES: { codigos: string[] }[] = [];

export const EMPLEADO = { id: '9029', nombre: 'JUAN ANTONIO GUERRERO MEDINA' };

export const TAREAS = {
  surtido: {
    actividad: 'SURTIDO Y REVISIÓN TRASPASO', // 3048:10064 (renombrada para el flujo de traspaso)
    documentoLabel: 'DocumentoID',
    documento: 'SURTIR TRASPASO', // 3048:10091
  },
  /** ERB-47987: Surtido + revisión unificados (variante 6004:2304 en Figma). El operador surte y revisa
      en un solo paso; termina con el botón "Finalizar" que salta a la facturación. */
  surtidoUnificado: {
    actividad: 'SURTIDO Y REVISIÓN UNIFICADA',
    documentoLabel: 'DocumentoID',
    documento: 'SURTIR Y REVISAR PEDIDO CLIENTE',
  },
  /** Traspaso: no se factura, solo se embarca (antes "FACTURAR Y EMBARCAR PEDIDO", Facturación 6004:1813). */
  embarqueTraspaso: {
    actividad: 'EMBARCAR TRASPASO',
    documentoLabel: 'TraspasoID',
    documento: TRASPASO.id,
  },
  fecha: '31/08/2023',
  hora: '11:30 a.m.',
};
