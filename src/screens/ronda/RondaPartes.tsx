/**
 * Piezas de la pantalla de ronda multipedido. Interfaz principal y vista filtrada según los mockups de
 * "Handheld for Claude" › Surtido multipedido (15:1437 / 15:1661, archivo Zf1wV1oULSD14o7TPW4da9); la parada de la
 * propuesta B (oculta) sigue sin respaldo en Figma (D48).
 */
import { OrderItemRow, type OrderItemStatus } from '@ds/components/molecules/OrderItemRow/OrderItemRow';
import { ProductSummary } from '@ds/components/molecules/ProductSummary/ProductSummary';
import { Chip } from '@ds/components/atoms/Chip/Chip';
import { Button } from '@ds/components/atoms/Button/Button';
import iconoA from '@assets/icons/contenedor-a.svg';
import iconoB from '@assets/icons/contenedor-b.svg';
import iconoC from '@assets/icons/contenedor-c.svg';
import iconoAInv from '@assets/icons/contenedor-a-invertido.svg';
import iconoBInv from '@assets/icons/contenedor-b-invertido.svg';
import iconoCInv from '@assets/icons/contenedor-c-invertido.svg';
import iconoACompleto from '@assets/icons/contenedor-a-completo.svg';
import iconoBCompleto from '@assets/icons/contenedor-b-completo.svg';
import iconoCCompleto from '@assets/icons/contenedor-c-completo.svg';
import { productoRonda, type AvancePedido, type LineaConsolidada } from '../../domain/ronda';
import type { Contenedor } from '../../mocks/ronda';
import styles from './SurtidoRonda.module.css';

export const statusLinea = (avance: number, total: number): OrderItemStatus =>
  avance <= 0 ? 'no-iniciado' : avance < total ? 'parcial' : 'completado';

const ICONO_CONTENEDOR: Record<Contenedor, string> = { A: iconoA, B: iconoB, C: iconoC };
/** Círculo blanco con la letra recortada: sobre el fondo azul del contenedor seleccionado la letra se ve azul. */
const ICONO_SELECCIONADO: Record<Contenedor, string> = { A: iconoAInv, B: iconoBInv, C: iconoCInv };
/** Contenedor completo sin seleccionar: letra en verde (41:3176 / 41:3192). */
const ICONO_COMPLETO: Record<Contenedor, string> = { A: iconoACompleto, B: iconoBCompleto, C: iconoCCompleto };

/**
 * Tres contenedores con su pedido y avance en piezas — "Container" 15:1500 (Handheld for Claude).
 * Tocar uno filtra la lista a ese pedido; tocarlo otra vez quita el filtro. Los demás se atenúan al 50 % (15:1661) y,
 * además, el seleccionado se rellena de azul con sombra (indicación del usuario, D49).
 */
export function ContenedoresResumen({
  avances,
  seleccionado,
  onSeleccionar,
}: {
  avances: AvancePedido[];
  seleccionado?: string;
  onSeleccionar?: (pedido: string | undefined) => void;
}) {
  return (
    <div className={styles.contenedores}>
      {avances.map((a) => {
        const activo = seleccionado === a.pedido.id;
        const atenuado = seleccionado !== undefined && !activo;
        return (
          <button
            key={a.pedido.id}
            type="button"
            className={[styles.contenedor, a.completo ? styles.contenedorListo : '', activo ? styles.seleccionado : '', atenuado ? styles.atenuado : ''].join(' ')}
            aria-pressed={activo}
            disabled={!onSeleccionar}
            onClick={() => onSeleccionar?.(seleccionado === a.pedido.id ? undefined : a.pedido.id)}
          >
            <img src={(activo ? ICONO_SELECCIONADO : a.completo ? ICONO_COMPLETO : ICONO_CONTENEDOR)[a.pedido.contenedor]} alt={`Contenedor ${a.pedido.contenedor}`} width={30} height={30} />
            <span className={styles.contenedorDatos}>
              <span>#{a.pedido.id}</span>
              <b>
                {a.separado} de {a.solicitado}
                {a.completo && ' ✓'}
              </b>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Chip de pedido: en 0 se queda blanco; parcial y completo toman los colores del chip de avance (D49). */
const ESTADO_TAG: Partial<Record<OrderItemStatus, string>> = { parcial: styles.tagParcial, completado: styles.tagListo };

/**
 * Card de la lista — 15:1528 (consolidada, con desglose "Stock" 15:1545) o 15:1752 (vista filtrada por pedido, sin desglose).
 * En la vista filtrada el chip muestra el avance de ese pedido; en la consolidada, el total de la ronda.
 */
export function LineaRonda({
  linea,
  pedido,
  separando,
  onClick,
}: {
  linea: LineaConsolidada;
  pedido?: string;
  separando: boolean;
  /** Abre el Detalle de producto de la ronda. */
  onClick?: () => void;
}) {
  const p = productoRonda(linea.codigo)!;
  const propio = pedido ? linea.porPedido.find((x) => x.pedido === pedido) : undefined;
  const avance = propio ? propio.separado : linea.avance;
  const total = propio ? propio.solicitado : linea.total;
  const negado = propio ? !!propio.motivoNegado : linea.negado;
  return (
    <OrderItemRow
      ronda
      onClick={onClick}
      codigo={linea.codigo}
      status={negado ? 'negado' : statusLinea(avance, total)}
      surtido={avance}
      solicitado={total}
      ubicacion={p.ubicacion}
      foto={p.foto}
      detalle={
        propio ? undefined : (
          <span className={styles.desglose}>
            {linea.porPedido.map((x) =>
              x.motivoNegado ? (
                <span key={x.pedido} className={`${styles.tag} ${styles.tagNegado}`}>
                  <b>{x.contenedor}</b> Negado
                </span>
              ) : (
                <span key={x.pedido} className={`${styles.tag} ${separando ? (ESTADO_TAG[statusLinea(x.separado, x.solicitado)] ?? '') : ''}`}>
                  <b>{x.contenedor}</b> {separando ? `${x.separado}/${x.solicitado}` : `${x.solicitado} pz`}
                </span>
              ),
            )}
          </span>
        )
      }
    />
  );
}

/** Propuesta B: una parada (ubicación) a la vez, con lo que va en cada contenedor. */
export function Parada({
  linea,
  indice,
  total,
  onAnterior,
  onSiguiente,
}: {
  linea: LineaConsolidada;
  indice: number;
  total: number;
  onAnterior: () => void;
  onSiguiente: () => void;
}) {
  const p = productoRonda(linea.codigo)!;
  return (
    <div className={styles.parada}>
      <div className={styles.paradaHeader}>
        <b>
          Parada {indice + 1} de {total}
        </b>
        <span>{p.ubicacion.slice(1).join(' · ')}</span>
      </div>
      <ProductSummary foto={p.foto} codigo={p.codigo} descripcion={p.descripcion} />
      <p className={styles.paradaInstruccion}>Escanea cada pieza y deposítala en su contenedor:</p>
      <div className={styles.paradaDestinos}>
        {linea.porPedido.map((x) => (
          <div key={x.pedido} className={`${styles.paradaDestino} ${x.separado >= x.solicitado ? styles.contenedorListo : ''}`}>
            <span className={styles.letraGrande}>{x.contenedor}</span>
            <span className={styles.paradaPedido}>Pedido {x.pedido}</span>
            <Chip status={statusLinea(x.separado, x.solicitado)} value={x.separado} total={x.solicitado} />
          </div>
        ))}
      </div>
      <div className={styles.paradaNav}>
        <Button variant="default" label="Anterior" className={styles.flex1} disabled={indice === 0} onClick={onAnterior} />
        <Button variant="default" label="Siguiente" className={styles.flex1} disabled={indice === total - 1} onClick={onSiguiente} />
      </div>
    </div>
  );
}
