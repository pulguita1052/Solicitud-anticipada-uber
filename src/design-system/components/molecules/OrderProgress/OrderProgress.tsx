/**
 * Figma: Avance del pedido (maestro en "📲 Surtido - Un pedido x ronda" › NO TOCAR)
 * nodeId: 1324:7100
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=1324-7100
 * Última sincronización: 2026-09-29
 * Variante "ronda": "Avance de la ronda" (Handheld for Claude, Surtido multipedido 15:1455) — título centrado,
 * sin número de pedido ni etiquetas de columna (ocultas en Figma).
 */
import type { ReactNode } from 'react';
import avance from '@assets/icons/avance-pedido.svg';
import completado from '@assets/icons/estado-completado.svg';
import elipse33 from '@assets/icons/elipse-33.svg';
import block from '@assets/icons/block.svg';
import parcial from '@assets/icons/estado-parcial.svg';
import pendiente from '@assets/icons/estado-pendiente.svg';
import styles from './OrderProgress.module.css';

type Props = {
  /** Requerido en la variante "pedido" (encabezado "Pedido 123456"). */
  pedido?: string;
  variante?: 'pedido' | 'ronda';
  completado: number;
  negado: number;
  parcial: number;
  pendientes: number;
};

export function OrderProgress({ variante = 'pedido', ...p }: Props) {
  const ronda = variante === 'ronda';
  return (
    <div className={`${styles.progress} ${ronda ? styles.ronda : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <img src={avance} alt="" width={11.161} height={13.708} />
            <span>{ronda ? 'Avance de la ronda' : 'Avance del pedido'}</span>
          </div>
          {!ronda && <b>Pedido {p.pedido}</b>}
        </div>
      </div>
      <div className={styles.body}>
        <Col label="Completado" value={p.completado} icon={<img src={completado} alt="" width={28.846} height={29.026} />} />
        <Col
          label="Negado"
          value={p.negado}
          icon={
            <span className={styles.negado}>
              <img src={elipse33} alt="" width={28.846} height={28.846} />
              <img src={block} alt="" width={20} height={20} className={styles.block} />
            </span>
          }
        />
        <Col label="Parcial" value={p.parcial} icon={<img src={parcial} alt="" width={28.846} height={28.846} />} />
        <Col label="Pendientes" value={p.pendientes} icon={<img src={pendiente} alt="" width={28.846} height={28.846} />} />
      </div>
    </div>
  );
}

function Col({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className={styles.col}>
      <span className={styles.colLabel}>{label}</span>
      <div className={styles.colValue}>
        {icon}
        <b>{value}</b>
      </div>
    </div>
  );
}
