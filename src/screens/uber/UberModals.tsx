/**
 * Modales inferiores del flujo de Uber (compartidos entre DatosFactura y SolicitudUber).
 *
 * - `OfrecimientoUberModal`: aparece sobre Datos de la factura cuando el embarque cumple los criterios
 *   de candidatura ERB-53024. Muestra únicamente total, cantidad de artículos y distancia.
 * - `ConsolidacionModal`: aparece cuando el cliente ya tiene una solicitud de reparto creada para la
 *   misma dirección (`ACTIVOS_POR_CLIENTE_DIRECCION`). Reemplaza al ofrecimiento.
 */
import iconoUber from '@assets/icons/modal-icono-uber.svg';
import iconoPregunta from '@assets/icons/modal-icono-pregunta.svg';
import grupo45 from '@assets/icons/grupo-45-cancelar.svg';
import { Button } from '@ds/components/atoms/Button/Button';
import { Divider } from '@ds/components/atoms/Divider/Divider';
import { ModalHeader, ModalIcon, ModalSheet } from '@ds/components/organisms/ModalSheet/ModalSheet';
import { SUCURSAL_ACTUAL } from '../../mocks/uber';
import styles from './UberModals.module.css';

const iconUber = <ModalIcon src={iconoUber} inset="-2.84% -2.27% -0.56% -1.14%" />;
const iconPregunta = <ModalIcon src={iconoPregunta} inset="-2.84% -2.27% -0.56% -1.14%" />;

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/**
 * Ofrecimiento: modal inferior con los tres datos clave para decidir (total, artículos, distancia).
 * Cliente / embarque / dirección quedan en la pantalla de fondo (Datos factura), donde ya son visibles.
 */
export function OfrecimientoUberModal({
  monto,
  articulos,
  totalLabel = 'Total',
  onCancelar,
  onContinuar,
}: {
  totalLabel?: string;
  monto: number;
  articulos: number;
  onCancelar: () => void;
  onContinuar: () => void;
}) {
  return (
    <ModalSheet icon={iconUber} gap={10} doubleShadow>
      <div className={styles.col}>
        <ModalHeader title="Este embarque es candidato para envío por Uber" />
        <p className={styles.pregunta}>¿Desea crear y solicitar el reparto por Uber?</p>
        <div className={styles.info}>
          <div className={styles.row}>
            <b>{totalLabel}</b>
            <span className={styles.valBig}>{currency.format(monto)}</span>
          </div>
          <Divider variant="modal" />
          <div className={styles.row}>
            <b>Total de artículos</b>
            <span>{articulos}</span>
          </div>
          <Divider variant="modal" />
          <div className={styles.row}>
            <b>Distancia</b>
            <span>{SUCURSAL_ACTUAL.distanciaKm} km</span>
          </div>
        </div>
        <div className={styles.buttons}>
          <Button variant="error" label="Ahora no" className={styles.flex1} onClick={onCancelar} />
          <Button variant="success" icon="check" label="Generar solicitud" className={styles.flex1} onClick={onContinuar} />
        </div>
      </div>
    </ModalSheet>
  );
}

/**
 * Consolidación: reemplaza al ofrecimiento cuando ya existe una solicitud CREADA para el mismo
 * cliente + dirección. Continuar genera una solicitud independiente; Cancelar cierra y regresa a
 * la pantalla anterior (el operador confirma o rechaza el envío desde ahí).
 */
export function ConsolidacionModal({ onCancelar, onContinuar }: { onCancelar: () => void; onContinuar: () => void }) {
  return (
    <ModalSheet icon={iconPregunta} gap={10} doubleShadow>
      <div className={styles.col}>
        <ModalHeader title="Cliente con solicitud existente" />
        <div className={styles.text}>
          <p>
            El cliente ya tiene una solicitud de reparto <b>creada</b> para la misma dirección.
          </p>
          <p>&#8203;</p>
          <p>
            En caso de <b>continuar</b>, se generará una solicitud independiente para este pedido.
          </p>
          <p>&#8203;</p>
        </div>
        <div className={styles.buttons}>
          <Button asset={grupo45} label="Cancelar" className={styles.flex1} onClick={onCancelar} />
          <Button variant="success" icon="check" label="Continuar" className={styles.flex1} onClick={onContinuar} />
        </div>
      </div>
    </ModalSheet>
  );
}
