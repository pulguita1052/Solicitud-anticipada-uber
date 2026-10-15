/**
 * Figma: Card revisión aleatoria (Surtido = No iniciado | Parcial | Completado | Negado | Revisado)
 * nodeId: 3086:11540
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=3086-11540
 * Última sincronización: 2026-09-29
 * Miniatura de la foto (`foto`): sin respaldo en Figma, agregada por indicación del usuario (2026-10-12, D47).
 * `detalle`: tercera fila de la card de surtido multipedido ("Stock", 15:1545 en Handheld for Claude); con él la card
 * toma las medidas de 15:1528 (gap 15, alto automático, foto sin invadir el relleno).
 */
import type { ReactNode } from 'react';
import { Chip, type ChipStatus } from '../../atoms/Chip/Chip';
import { RBadge } from '../../atoms/RBadge/RBadge';
import styles from './OrderItemRow.module.css';

export type OrderItemStatus = Exclude<ChipStatus, 'negado-promocion'>;

type Props = {
  codigo: string;
  status: OrderItemStatus;
  surtido: number;
  solicitado: number;
  /** Insignia "R". En Figma la variante "Revisado" es Completado + R; Parcial + R aparece como sobrescritura (discrepancias D26). */
  revisado?: boolean;
  ubicacion: [string, string, string, string];
  /** Foto del producto: miniatura de 60 × 60 a la izquierda, sin borde (D47). */
  foto?: string;
  /** Tercera fila (desglose por contenedor en la ronda multipedido) y medidas de la card 15:1528. */
  detalle?: ReactNode;
  /** Card de la ronda (15:1528) aunque no haya detalle (vista filtrada 15:1752). */
  ronda?: boolean;
  onClick?: () => void;
};

export function OrderItemRow({ codigo, status, surtido, solicitado, revisado, ubicacion, foto, detalle, ronda, onClick }: Props) {
  return (
    <button type="button" className={`${styles.row} ${ronda || detalle ? styles.ronda : ''}`} onClick={onClick} disabled={!onClick}>
      {foto && (
        <div className={styles.foto}>
          <img src={foto} alt="" />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.top}>
          <span className={styles.codigo}>{codigo}</span>
          <div className={styles.right}>
            {revisado && <RBadge />}
            <Chip status={status} value={surtido} total={solicitado} />
          </div>
        </div>
        <div className={styles.ubicacion}>
          {ubicacion.map((u, i) => (
            <span key={i} className={styles.ubicacionItem}>
              {i > 0 && <b>|</b>}
              <span>{u}</span>
            </span>
          ))}
        </div>
        {detalle}
      </div>
    </button>
  );
}
