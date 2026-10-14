/**
 * Figma: Vista foto — overlay al tocar la foto del Detalle de producto (📲 Surtido - Un pedido x ronda)
 * nodeId: 162:6994 (Frame 208 → NODE OVERLAY 162:6994; Frame 160 → CLOSE)
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=162-6994
 * Última sincronización: 2026-10-14
 *
 * Se cierra solo con la ✕ y la foto no admite zoom (confirmado por el usuario, igual que en sucursal).
 */
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { Button } from '@ds/components/atoms/Button/Button';
import styles from './VistaFoto.module.css';

export function VistaFoto({ foto, onClose }: { foto: string; onClose: () => void }) {
  return (
    <div className={styles.overlay} role="dialog" aria-label="Foto del producto">
      <div className={styles.contenido}>
        <img className={styles.foto} src={foto} alt="" draggable={false} />
      </div>
      <BottomBar variant="footer">
        <Button variant="error" icon="cross" label="Cerrar" className={styles.cerrar} onClick={onClose} />
      </BottomBar>
    </div>
  );
}
