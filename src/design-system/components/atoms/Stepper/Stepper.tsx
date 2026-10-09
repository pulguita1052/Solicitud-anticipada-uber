/**
 * Figma: selector de cantidad — Grupo 103 (−) · Grupo 104 (valor) · Grupo 105 (+)
 *        Inactivo (gris): "Datos surtido" 325:3041 en 📲 Surtido - Un pedido x ronda
 * nodeId: 3199:6429
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=3199-6429
 * Última sincronización: 2026-09-29
 */
import menos from '@assets/icons/stepper-menos.svg';
import mas from '@assets/icons/stepper-mas.svg';
import menosInactivo from '@assets/icons/stepper-menos-inactivo.svg';
import masInactivo from '@assets/icons/stepper-mas-inactivo.svg';
import styles from './Stepper.module.css';

type Props = {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  /** Íconos alternos (p. ej. versión gris cuando el botón está inhabilitado en Facturación). */
  minusAsset?: string;
  plusAsset?: string;
  /** Bloquea ambos botones y los muestra en gris (325:3041). */
  disabled?: boolean;
};

export function Stepper({ value, min = 0, max = Number.POSITIVE_INFINITY, onChange, minusAsset, plusAsset, disabled }: Props) {
  const menosOff = disabled || value <= min;
  const masOff = disabled || value >= max;
  return (
    <div className={styles.stepper}>
      <button type="button" className={styles.side} disabled={menosOff} onClick={() => onChange(Math.max(min, value - 1))} aria-label="Menos">
        <img src={minusAsset ?? (menosOff ? menosInactivo : menos)} alt="" width={52.816} height={43} />
      </button>
      <div className={styles.value}>{value}</div>
      <button type="button" className={styles.side} disabled={masOff} onClick={() => onChange(Math.min(max, value + 1))} aria-label="Más">
        <img src={plusAsset ?? (masOff ? masInactivo : mas)} alt="" width={52.815} height={43} />
      </button>
    </div>
  );
}
