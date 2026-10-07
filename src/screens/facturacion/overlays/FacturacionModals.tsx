/**
 * Figma: modales de Facturación y Embarque
 *   Nuevo embarque 6157:13865 · Embarque creado 6157:14047
 *   Agregar embarque (2 activos) 6182:16269 · Agregar embarque (selector) 6166:15101
 *   Factura agregada 6178:15531
 * Última sincronización: 2026-09-29
 */
import { useState } from 'react';
import iconoPlus from '@assets/icons/modal-icono-embarque-plus.svg';
import iconoCheck from '@assets/icons/modal-icono-embarque-check.svg';
import grupo45 from '@assets/icons/grupo-45-cancelar.svg';
import { ModalHeader, ModalIcon, ModalSheet } from '@ds/components/organisms/ModalSheet/ModalSheet';
import { Button } from '@ds/components/atoms/Button/Button';
import { FloatingLabelInput } from '@ds/components/molecules/FloatingLabelInput/FloatingLabelInput';
import { EMBARQUES_ACTIVOS } from '../../../mocks/facturacion';
import styles from './FacturacionModals.module.css';

/** Documento que se embarca: factura (pedido de cliente) o traspaso (movimiento entre sucursales). */
export type Unidad = 'factura' | 'traspaso';

const iconPlus = <ModalIcon src={iconoPlus} inset="-2.84% -2.27% -0.56% -1.14%" />;
const iconCheck = <ModalIcon src={iconoCheck} inset="-2.84% -2.27% -0.56% -1.14%" />;

/* ---------- Nuevo embarque — 6157:13865 ---------- */
export function NuevoEmbarqueModal({ onCancel, onConfirm, unidad = 'factura' }: { onCancel: () => void; onConfirm: () => void; unidad?: Unidad }) {
  return (
    <ModalSheet icon={iconPlus} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <ModalHeader title="Nuevo embarque" />
        <div className={styles.text}>
          <p>{unidad === 'traspaso' ? 'No existe un embarque activo para esta sucursal destino.' : 'No existe un embarque activo para este cliente.'}</p>
          <p>
            <br />
            ¿Continuar con la creación de un nuevo embarque?
          </p>
          <p>&#8203;</p>
        </div>
        <div className={styles.buttons}>
          <Button asset={grupo45} label="Cancelar" className={styles.flex1} onClick={onCancel} />
          <Button variant="success" icon="check" label="Aceptar" className={styles.flex1} onClick={onConfirm} />
        </div>
      </div>
    </ModalSheet>
  );
}

/* ---------- Embarque creado — 6157:14047 ---------- */
export function EmbarqueCreadoModal({ numero, onConfirm, unidad = 'factura' }: { numero: string; onConfirm: () => void; unidad?: Unidad }) {
  return (
    <ModalSheet icon={iconCheck} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <ModalHeader title="Embarque creado" />
        <p className={styles.text} style={{ textAlign: 'center' }}>
          Se registró correctamente el embarque para {unidad === 'traspaso' ? 'este traspaso' : 'esta factura'}.
        </p>
        <div className={styles.box}>
          <p className={styles.boxTitle}>No. de embarque</p>
          <p className={styles.boxValue}>{numero}</p>
        </div>
        <Button variant="success" icon="check" checkWidth={31.012} label="Aceptar" className={styles.full} onClick={onConfirm} />
      </div>
    </ModalSheet>
  );
}

/* ---------- Agregar embarque (elección) — 6182:16269 ---------- */
export function AgregarEmbarqueEleccionModal({
  cantidad,
  onNuevo,
  onAgregar,
  onCancel,
  unidad = 'factura',
}: {
  unidad?: Unidad;
  cantidad: number;
  onNuevo: () => void;
  onAgregar: () => void;
  onCancel: () => void;
}) {
  return (
    <ModalSheet icon={iconPlus} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <ModalHeader title="Agregar embarque" />
        <div className={styles.text}>
          <p>Existen {cantidad} embarques activos para {unidad === 'traspaso' ? 'esta misma sucursal destino' : 'este mismo cliente'}.</p>
          <p>&#8203;</p>
          <p>¿Deseas agregar {unidad === 'traspaso' ? 'este traspaso' : 'esta factura'} a uno existente o generar uno nuevo?</p>
          <p>&#8203;</p>
        </div>
        <div className={styles.buttons}>
          <Button variant="default" label="Nuevo embarque" className={styles.flex1} onClick={onNuevo} />
          <Button variant="success" label="Agregar existente" className={styles.flex1} onClick={onAgregar} />
        </div>
        <Button variant="error" icon="cross" label="Cancelar" className={styles.full} onClick={onCancel} />
      </div>
    </ModalSheet>
  );
}

/* ---------- Agregar embarque (selector) — 6166:15101 ---------- */
export function AgregarEmbarqueSelectorModal({ onCancel, onConfirm, unidad = 'factura' }: { onCancel: () => void; onConfirm: (numero: string) => void; unidad?: Unidad }) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const opciones = EMBARQUES_ACTIVOS;
  const sel = opciones.find((e) => e.numero === seleccion);
  const docs = unidad === 'traspaso' ? 'traspaso(s)' : 'factura(s)';
  return (
    <ModalSheet icon={iconPlus} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <ModalHeader title="Agregar embarque" />
        <p className={styles.text}>Seleccione el embarque al que desea agregar {unidad === 'traspaso' ? 'el traspaso' : 'la factura'}:</p>
        <FloatingLabelInput
          label={sel ? 'Embarque' : ''}
          value={sel ? `${sel.numero} · ${sel.facturas} ${docs} · ${sel.fecha}` : 'Embarque'}
          isSelect
          labelFont="select"
          onClick={() => setAbierto((a) => !a)}
        />
        {abierto && (
          <div className={styles.opciones}>
            {opciones.map((o) => (
              <button
                type="button"
                key={o.numero}
                className={styles.opcion}
                onClick={() => {
                  setSeleccion(o.numero);
                  setAbierto(false);
                }}
              >
                {o.numero} · {o.facturas} {docs} · {o.fecha}
              </button>
            ))}
          </div>
        )}
        <div className={styles.buttons}>
          <Button asset={grupo45} label="Cancelar" className={styles.flex1} onClick={onCancel} />
          <Button variant="success" icon="check" label="Aceptar" disabled={!sel} className={styles.flex1} onClick={() => sel && onConfirm(sel.numero)} />
        </div>
      </div>
    </ModalSheet>
  );
}

/* ---------- Factura agregada — 6178:15531 ---------- */
export function FacturaAgregadaModal({ numero, facturas, fecha, onConfirm, unidad = 'factura' }: { numero: string; facturas: number; fecha: string; onConfirm: () => void; unidad?: Unidad }) {
  return (
    <ModalSheet icon={iconCheck} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <ModalHeader title={unidad === 'traspaso' ? 'Traspaso agregado' : 'Factura agregada'} />
        <p className={styles.text} style={{ textAlign: 'center' }}>
          {unidad === 'traspaso' ? 'Traspaso agregado' : 'Factura agregada'} correctamente al embarque:
        </p>
        <div className={styles.box}>
          <p className={styles.boxTitle}>No. de embarque</p>
          <p className={styles.boxValue}>{numero}</p>
          <p className={styles.boxDetail}>
            ({facturas} {unidad === 'traspaso' ? 'traspasos' : 'facturas'}) {fecha}
          </p>
        </div>
        <Button variant="success" icon="check" checkWidth={31.012} label="Aceptar" className={styles.full} onClick={onConfirm} />
      </div>
    </ModalSheet>
  );
}
