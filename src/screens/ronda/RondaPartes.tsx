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
import { productoRonda, type AvancePedido, type LineaConsolidada } from '../../domain/ronda';
import type { Contenedor } from '../../mocks/ronda';
import styles from './SurtidoRonda.module.css';

export const statusLinea = (avance: number, total: number): OrderItemStatus =>
  avance <= 0 ? 'no-iniciado' : avance < total ? 'parcial' : 'completado';

const ICONO_CONTENEDOR: Record<Contenedor, string> = { A: iconoA, B: iconoB, C: iconoC };

/**
 * Tres contenedores con su pedido y avance en piezas — "Container" 15:1500 (Handheld for Claude).
 * Tocar uno filtra la lista a ese pedido (vista filtrada 15:1661: los demás al 50 % de opacidad); tocarlo otra vez quita el filtro.
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
        const atenuado = seleccionado !== undefined && seleccionado !== a.pedido.id;
        return (
          <button
            key={a.pedido.id}
            type="button"
            className={[styles.contenedor, a.completo ? styles.contenedorListo : '', atenuado ? styles.atenuado : ''].join(' ')}
            aria-pressed={seleccionado === a.pedido.id}
            disabled={!onSeleccionar}
            onClick={() => onSeleccionar?.(seleccionado === a.pedido.id ? undefined : a.pedido.id)}
          >
            <img src={ICONO_CONTENEDOR[a.pedido.contenedor]} alt={`Contenedor ${a.pedido.contenedor}`} width={30} height={30} />
            <span className={styles.contenedorDatos}>
              <span>#{a.pedido.id}</span>
              <b>
                {a.separado} de {a.solicitado}
              </b>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Card de la lista — 15:1528 (consolidada, con desglose "Stock" 15:1545) o 15:1752 (vista filtrada por pedido, sin desglose).
 * En la vista filtrada el chip muestra el avance de ese pedido; en la consolidada, el total de la ronda.
 */
export function LineaRonda({ linea, pedido, separando }: { linea: LineaConsolidada; pedido?: string; separando: boolean }) {
  const p = productoRonda(linea.codigo)!;
  const propio = pedido ? linea.porPedido.find((x) => x.pedido === pedido) : undefined;
  const avance = propio ? propio.separado : linea.avance;
  const total = propio ? propio.solicitado : linea.total;
  return (
    <OrderItemRow
      ronda
      codigo={linea.codigo}
      status={statusLinea(avance, total)}
      surtido={avance}
      solicitado={total}
      ubicacion={p.ubicacion}
      foto={p.foto}
      detalle={
        propio ? undefined : (
          <span className={styles.desglose}>
            {linea.porPedido.map((x) => (
              <span key={x.pedido} className={`${styles.tag} ${separando && x.separado >= x.solicitado ? styles.tagListo : ''}`}>
                <b>{x.contenedor}</b> {separando ? `${x.separado}/${x.solicitado}` : `${x.solicitado} pz`}
              </span>
            ))}
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
