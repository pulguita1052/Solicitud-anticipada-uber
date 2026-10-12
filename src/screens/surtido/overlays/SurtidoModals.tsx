/**
 * Figma: modales del Surtido de órdenes (📲 Surtido - Un pedido x ronda, 24:16)
 *   Modal ingresar cantidad 131:6184 (= 3236:16208) · Modal Menú 182:9267 (= 3126:14186)
 *   Modal pendientes parciales 182:9894 (= 3126:14406) · Finalizar surtido (automático) 197:23064
 *   Modal códigos negados / sin surtir 190:10418 · Selección de motivo negado 1246:7590 (act.) / 1246:7339 (inact.)
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=24-16
 * Figma: ❌ Negar totalidad traspaso (6874:864)
 *   Menú con "Rechazar traspaso" 7020:25441 (propuesta #1) / 7053:26441 (propuesta #2)
 *   Rechazar traspaso (confirmación) 7020:25766 / 7053:26522 (con leyenda) · motivo 7040:25916 (inact.) / 7040:26148 (act.)
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=6874-864
 * Última sincronización: 2026-10-12
 */
import { Fragment, useState } from 'react';
import iconoCantidad from '@assets/icons/modal-icono-cantidad.svg';
import iconoMenu from '@assets/icons/modal-icono-menu.svg';
import iconoPregunta from '@assets/icons/modal-icono-pregunta.svg';
import iconoNegado from '@assets/icons/modal-icono-negado.svg';
import iconoMotivo from '@assets/icons/modal-icono-motivo-negado.svg';
import iconoRechazar from '@assets/icons/modal-icono-rechazar-traspaso.svg';
import iconoInfo from '@assets/icons/info.svg';
import selectCheck from '@assets/icons/select-check.svg';
import selectPoligono from '@assets/icons/select-poligono.svg';
import botonCancelar from '@assets/icons/boton-cancelar.svg';
import grupo45 from '@assets/icons/grupo-45-cancelar.svg';
import { ModalHeader, ModalIcon, ModalSheet } from '@ds/components/organisms/ModalSheet/ModalSheet';
import { Button, type ButtonVariant } from '@ds/components/atoms/Button/Button';
import { Chip } from '@ds/components/atoms/Chip/Chip';
import { Divider } from '@ds/components/atoms/Divider/Divider';
import styles from './overlays.module.css';

const iconPregunta = <ModalIcon src={iconoPregunta} inset="-2.84% -2.27% -0.56% -1.14%" />;

/* ---------- Ingresa la cantidad surtida en contenedor — 131:6184 ----------
   Sticky note 321:3020: inicialmente no hay cantidad y el botón de continuar está deshabilitado (#BDBDBD, 321:3021). */
export function CantidadModal({ codigo, onCancel, onConfirm }: { codigo: string; onCancel: () => void; onConfirm: (n: number) => void }) {
  const [valor, setValor] = useState('');
  const vacio = valor === '';
  return (
    <ModalSheet icon={<ModalIcon src={iconoCantidad} inset="-2.84% -3.98% -0.56% -2.84%" offsetX={-1} />} gap={10}>
      <div className={styles.col} style={{ gap: 16 }}>
        <ModalHeader title="Ingresa la cantidad surtida en contenedor">
          <div className={styles.codeRow}>
            <b>Código</b>
            <span>{codigo}</span>
          </div>
        </ModalHeader>
        <input
          className={styles.qtyInput}
          value={valor}
          inputMode="numeric"
          autoFocus
          aria-label="Cantidad"
          onChange={(e) => setValor(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && !vacio && onConfirm(parseInt(valor, 10))}
        />
        <div className={styles.buttons}>
          <Button asset={botonCancelar} label="Cancelar" className={styles.half} onClick={onCancel} />
          <Button variant="success" icon="check" label="Aceptar" disabled={vacio} className={styles.half} onClick={() => onConfirm(parseInt(valor, 10))} />
        </div>
      </div>
    </ModalSheet>
  );
}

/* ---------- Menú (⋮) — 182:9267 · con "Rechazar traspaso" 7020:25441 (propuesta #1) / 7053:26441 (propuesta #2) ---------- */
export function MenuModal({
  onRepetirAudio,
  onFinalizar,
  onCancel,
  rechazar,
  finalizarDisabled,
}: {
  onRepetirAudio: () => void;
  onFinalizar: () => void;
  onCancel: () => void;
  /** Botón "Rechazar traspaso": rojo en la propuesta #1, azul en la #2. */
  rechazar?: { variant: ButtonVariant; onClick: () => void };
  /** Propuesta #1: "Finalizar surtido" gris mientras se ofrece rechazar (7114:10977). */
  finalizarDisabled?: boolean;
}) {
  return (
    <ModalSheet icon={<ModalIcon src={iconoMenu} inset="-2.75% -1.7% -0.66% -1.7%" />} gap={10}>
      <div className={styles.col} style={{ gap: 15 }}>
        <ModalHeader title="Menú" gap={17} dividerWidth={415.902} />
        <div className={styles.col} style={{ gap: 15, alignItems: 'center' }}>
          <Button variant="default" label="Repetir audio" className={styles.full} onClick={onRepetirAudio} />
          {rechazar && <Button variant={rechazar.variant} label="Rechazar traspaso" className={styles.full} onClick={rechazar.onClick} />}
          <Button variant="error" label="Finalizar surtido" disabled={finalizarDisabled} className={styles.full} onClick={onFinalizar} />
        </div>
      </div>
      <Button variant="error" icon="cross" label="Cancelar" className={styles.full} onClick={onCancel} />
    </ModalSheet>
  );
}

/* ---------- Finalizar surtido (códigos parciales) — 182:9894 ---------- */
export type ParcialRow = { codigo: string; surtido: number; solicitado: number; existencia: number };

export function ParcialesModal({ rows, onCancel, onConfirm }: { rows: ParcialRow[]; onCancel: () => void; onConfirm: () => void }) {
  return (
    <ModalSheet icon={iconPregunta} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <p className={styles.subtitle} style={{ width: '100%', textAlign: 'center' }}>
          Finalizar surtido
        </p>
        <Divider variant="modal" />
        <div className={styles.text}>
          <p>
            Tienes códigos <b>surtidos</b> <b>parcialmente.</b> ¿Deseas continuar?
          </p>
          <p>Revisa con cuidado la información, las piezas solicitadas podrían estar en otro lado.</p>
          <p>&#8203;</p>
        </div>
        <div className={styles.partialList}>
          {rows.map((r, i) => (
            <Fragment key={r.codigo}>
              {i > 0 && <Divider variant="modal" />}
              <div className={styles.partialRow}>
                <span className={styles.code20}>{r.codigo}</span>
                <Chip status="parcial" value={r.surtido} total={r.solicitado} />
                <div className={styles.existencia}>
                  <b>Existencia:</b>
                  <span>{r.existencia}</span>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
        <div className={styles.buttons}>
          <Button asset={grupo45} label="Cancelar" className={styles.flex1} onClick={onCancel} />
          <Button variant="success" icon="check" label="Aceptar" className={styles.flex1} onClick={onConfirm} />
        </div>
      </div>
    </ModalSheet>
  );
}

/* ---------- Finalizar surtido (todo surtido) — 197:23064 ---------- */
export function FinalizarModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <ModalSheet icon={iconPregunta} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <p className={styles.subtitle} style={{ width: '100%', textAlign: 'center' }}>
          Finalizar surtido
        </p>
        <Divider variant="modal" />
        <p className={styles.text}>
          Haz surtido el total de productos solicitados ¿Deseas finalizar la ronda?
          <br />
          <br />
        </p>
        <div className={styles.buttons}>
          <Button asset={grupo45} label="Cancelar" className={styles.flex1} onClick={onCancel} />
          <Button variant="success" icon="check" label="Aceptar" className={styles.flex1} onClick={onConfirm} />
        </div>
      </div>
    </ModalSheet>
  );
}

/* ---------- No es posible finalizar surtido (códigos sin surtir) — 190:10418 ---------- */
export function SinSurtirModal({ onCancel }: { onCancel: () => void }) {
  return (
    <ModalSheet icon={<ModalIcon src={iconoNegado} inset="-2.84% -2.27% -0.56% -1.14%" />} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <p className={styles.subtitle} style={{ width: '100%', textAlign: 'center' }}>
          No es posible finalizar surtido
        </p>
        <Divider variant="modal" />
        <div className={styles.text}>
          <p>
            Tienes <b>códigos sin surtir</b>, para finalizar el surtido primero deberás negarlos entrando al detalle del producto.
          </p>
          <p>&#8203;</p>
        </div>
        <Button variant="error" icon="cross" label="Cancelar" className={styles.full} onClick={onCancel} />
      </div>
    </ModalSheet>
  );
}

/* ---------- Selección de motivo negado — 1246:7339 (inact.) / 1246:7590 (act.) ---------- */
export function MotivoNegadoModal({
  codigo,
  descripcion,
  motivos,
  onCancel,
  onConfirm,
}: {
  codigo: string;
  descripcion: string;
  motivos: string[];
  onCancel: () => void;
  onConfirm: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState('');
  return (
    <ModalSheet icon={<ModalIcon src={iconoMotivo} inset="-2.84% -2.27% -0.56% -1.14%" />} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <p className={styles.subtitle} style={{ width: '100%', textAlign: 'center' }}>
          Selección de motivo negado
        </p>
        <Divider variant="modal" />
        <div className={styles.col} style={{ gap: 10 }}>
          <div className={styles.codeRow}>
            <b>Código</b>
            <span>{codigo}</span>
          </div>
          <p className={styles.descripcion}>{descripcion}</p>
        </div>
        <label className={styles.select}>
          <img src={selectCheck} alt="" width={18} height={18} />
          <select value={motivo} onChange={(e) => setMotivo(e.target.value)} aria-label="Motivo negado">
            <option value="" disabled>
              Seleccionar una opción
            </option>
            {motivos.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <img className={styles.selectArrow} src={selectPoligono} alt="" width={13} height={6} />
        </label>
        <div className={styles.buttons}>
          <Button asset={grupo45} label="Cancelar" className={styles.flex1} onClick={onCancel} />
          <Button variant="success" icon="check" label="Aceptar" disabled={!motivo} className={styles.flex1} onClick={() => onConfirm(motivo)} />
        </div>
      </div>
    </ModalSheet>
  );
}

/* ---------- Rechazar traspaso (confirmación) — 7020:25766 · con leyenda 7053:26522 ---------- */
export type DatosTraspaso = { sucursalDestino: string; peticion: string; tipo: string };

const iconRechazar = <ModalIcon src={iconoRechazar} inset="-2.84% -2.27% -0.56% -1.14%" />;

export function RechazarTraspasoModal({
  traspaso,
  leyenda,
  onCancel,
  onConfirm,
}: {
  traspaso: DatosTraspaso;
  /** Propuesta #2: "Las piezas surtidas se marcarán como rechazadas." (7060:28002). */
  leyenda?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalSheet icon={iconRechazar} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <p className={styles.subtitle} style={{ width: '100%', textAlign: 'center' }}>
          Rechazar traspaso
        </p>
        <Divider variant="modal" />
        {leyenda && (
          <div className={styles.aviso}>
            <img src={iconoInfo} alt="" width={20} height={20} />
            <p>Las piezas surtidas se marcarán como rechazadas.</p>
          </div>
        )}
        <p className={styles.text16}>¿Deseas rechazar el traspaso?</p>
        <div className={styles.traspaso}>
          <div className={styles.dato}>
            <p className={styles.datoLabel}>Sucursal destino</p>
            <p className={styles.sucursal}>{traspaso.sucursalDestino}</p>
          </div>
          <div className={styles.datosRow}>
            <div className={styles.dato}>
              <p className={styles.datoLabel}>Petición</p>
              <p className={styles.datoValor}>{traspaso.peticion}</p>
            </div>
            <div className={styles.dato}>
              <p className={styles.datoLabel}>Tipo</p>
              <p className={styles.datoValor}>{traspaso.tipo}</p>
            </div>
          </div>
        </div>
        <div className={styles.text16}>
          <p>Se solicitará el motivo de esta acción.</p>
          <p>&#8203;</p>
        </div>
        <div className={styles.buttons}>
          <Button variant="error" icon="cross" label="Cancelar" className={styles.flex1} onClick={onCancel} />
          <Button variant="success" icon="check" label="Aceptar" className={styles.flex1} onClick={onConfirm} />
        </div>
      </div>
    </ModalSheet>
  );
}

/* ---------- Rechazar traspaso (motivo) — 7040:25916 (inact.) / 7040:26148 (act.) ---------- */
export function MotivoRechazoModal({
  motivos,
  onCancel,
  onConfirm,
}: {
  motivos: string[];
  onCancel: () => void;
  onConfirm: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState('');
  return (
    <ModalSheet icon={iconRechazar} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <p className={styles.subtitle} style={{ width: '100%', textAlign: 'center' }}>
          Rechazar traspaso
        </p>
        <Divider variant="modal" />
        <p className={styles.text16} style={{ textAlign: 'left' }}>
          Seleccione el motivo de rechazo de traspaso:
        </p>
        <label className={styles.selectRechazo}>
          <select value={motivo} onChange={(e) => setMotivo(e.target.value)} aria-label="Motivo">
            <option value="" disabled>
              Motivo
            </option>
            {motivos.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {motivo && (
            <span className={styles.selectLabel} aria-hidden>
              Motivo
            </span>
          )}
          <img className={styles.selectArrow} src={selectPoligono} alt="" width={13} height={6} />
        </label>
        <div className={styles.buttons}>
          <Button variant="error" icon="cross" label="Cancelar" className={styles.flex1} onClick={onCancel} />
          <Button variant="success" icon="check" label="Aceptar" disabled={!motivo} className={styles.flex1} onClick={() => onConfirm(motivo)} />
        </div>
      </div>
    </ModalSheet>
  );
}
