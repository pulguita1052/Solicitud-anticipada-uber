/**
 * Piezas de la pantalla de ronda multipedido. Sin respaldo en Figma (2888:9537 vacía, D48): se construyen con
 * OrderItemRow, ProductSummary, Chip y Button del sistema de diseño y con tokens existentes.
 */
import { OrderItemRow, type OrderItemStatus } from '@ds/components/molecules/OrderItemRow/OrderItemRow';
import { ProductSummary } from '@ds/components/molecules/ProductSummary/ProductSummary';
import { Chip } from '@ds/components/atoms/Chip/Chip';
import { Button } from '@ds/components/atoms/Button/Button';
import { productoRonda, type AvancePedido, type LineaConsolidada, type RondaState } from '../../domain/ronda';
import styles from './SurtidoRonda.module.css';

export const statusLinea = (avance: number, total: number): OrderItemStatus =>
  avance <= 0 ? 'no-iniciado' : avance < total ? 'parcial' : 'completado';

/** Tres contenedores con su pedido y avance en piezas. */
export function ContenedoresResumen({ avances }: { avances: AvancePedido[] }) {
  return (
    <div className={styles.contenedores}>
      {avances.map((a) => (
        <div key={a.pedido.id} className={`${styles.contenedor} ${a.completo ? styles.contenedorListo : ''}`}>
          <span className={styles.letra}>{a.pedido.contenedor}</span>
          <div className={styles.contenedorDatos}>
            <b>{a.pedido.id}</b>
            <span>{a.completo ? 'Listo' : `${a.separado} de ${a.solicitado} pz`}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Aviso fijo con el último escaneo: a qué contenedor va cada pieza (no bloquea el escaneo siguiente). */
export function UltimoEscaneo({ ultimo }: { ultimo: RondaState['ultimo'] }) {
  if (!ultimo) {
    return <div className={`${styles.ultimo} ${styles.ultimoVacio}`}>Escanea una pieza para saber en qué contenedor va.</div>;
  }
  return (
    <div className={styles.ultimo} aria-live="polite">
      <span>
        Coloca <b>{ultimo.codigo}</b> en:
      </span>
      <div className={styles.ultimoDestinos}>
        {ultimo.asignaciones.map((a) => (
          <span key={a.pedido} className={styles.destino}>
            <span className={styles.letraGrande}>{a.contenedor}</span>
            <b>{a.cantidad} pz</b>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Fila de la lista consolidada: card de producto + desglose por contenedor. */
export function LineaRonda({ linea, separando }: { linea: LineaConsolidada; separando: boolean }) {
  const p = productoRonda(linea.codigo)!;
  return (
    <div className={styles.linea}>
      <OrderItemRow
        codigo={linea.codigo}
        status={statusLinea(linea.avance, linea.total)}
        surtido={linea.avance}
        solicitado={linea.total}
        ubicacion={p.ubicacion}
        foto={p.foto}
      />
      <div className={styles.desglose}>
        {linea.porPedido.map((x) => (
          <span key={x.pedido} className={`${styles.tag} ${separando && x.separado >= x.solicitado ? styles.tagListo : ''}`}>
            <b>{x.contenedor}</b> {separando ? `${x.separado}/${x.solicitado}` : `${x.solicitado} pz`}
          </span>
        ))}
      </div>
    </div>
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
