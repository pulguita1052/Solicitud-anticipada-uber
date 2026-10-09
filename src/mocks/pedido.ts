/**
 * Datos simulados del pedido. Productos tomados de 🔎 Revisión - Durante el surtido (3048:10138, 3091:14568);
 * tareas y motivos de 📲 Surtido - Un pedido x ronda (86:37, 197:20499, 1246:7590).
 * Nombres de campos alineados al modelo legado (docs/tecnico/referencias.md §3).
 */
import foto1394000 from '@assets/images/producto-1394000.jpg';
import foto2546000 from '@assets/images/producto-2546000.jpg';

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
  /** Precio unitario de venta (para calcular el monto del pedido). */
  precioUnitario: number;
};

const ubicacion: ProductoPedido['ubicacion'] = ['Planta baja', 'Pasillo 18', 'Torre 5', 'Nivel 1'];
const base = { ubicacion, planta: 'Planta baja', pasillo: '18', torre: '5', nivel: '1' };

export const PEDIDO_ID = '123456';

/** Pedido reducido a 2 productos para simplificar la demo. Total del pedido = $4,000 (10 × $300 + 5 × $200). */
export const PRODUCTOS: ProductoPedido[] = [
  {
    ...base,
    codigo: '1394000',
    descripcion: 'CINTA AISLANTE NEGRO 60 PLASTICA VERZE 20 U/L',
    foto: foto1394000,
    existencia: 100, // PENDIENTE: Figma no muestra la existencia de 1394000; se toma la de la cinta 1394001 (131:6465)
    solicitado: 10,
    precioUnitario: 300, // 10 × $300 = $3,000
  },
  {
    ...base,
    codigo: '2546000',
    descripcion: 'INTERRUPTOR LLAVE 11 TIPO UNIVERSAL CAMIONES 60-79 POLLAK 31',
    foto: foto2546000,
    existencia: 8,
    solicitado: 5,
    precioUnitario: 200, // 5 × $200 = $1,000
  },
];

export const EMPLEADO = { id: '9029', nombre: 'JUAN ANTONIO GUERRERO MEDINA' };

export const TAREAS = {
  surtido: {
    actividad: 'SURTIR PEDIDO CLIENTE', // 86:37
    documentoLabel: 'DocumentoID',
    documento: 'SURTIR PEDIDO CLIENTE',
  },
  /** Siguiente tarea al finalizar el surtido (197:20499). Fuera del alcance de esta rama: no se puede aceptar. */
  revision: {
    actividad: 'REVISAR PEDIDO CLIENTE',
    documentoLabel: 'DocumentoID',
    documento: 'SURTIR PEDIDO CLIENTE',
  },
  fecha: '31/08/2023',
  hora: '11:30 a.m.',
};

/** Opciones del select "Selección de motivo negado" (1246:7590). PENDIENTE: Figma solo muestra "Sin existencia". */
export const MOTIVOS_NEGADO = ['Sin existencia'];
