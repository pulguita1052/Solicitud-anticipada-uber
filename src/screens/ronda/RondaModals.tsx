/**
 * Modales de la ronda multipedido. Sin respaldo en Figma (2888:9537 vacía): se componen con los mismos
 * elementos de "Finalizar surtido" (197:23064) y "Modal pendientes parciales" (182:9894).
 */
import { Fragment } from 'react';
import iconoPregunta from '@assets/icons/modal-icono-pregunta.svg';
import grupo45 from '@assets/icons/grupo-45-cancelar.svg';
import { ModalIcon, ModalSheet } from '@ds/components/organisms/ModalSheet/ModalSheet';
import { Button } from '@ds/components/atoms/Button/Button';
import { Chip } from '@ds/components/atoms/Chip/Chip';
import { Divider } from '@ds/components/atoms/Divider/Divider';
import type { Contenedor } from '../../mocks/ronda';
import styles from '../surtido/overlays/overlays.module.css';
import ronda from './SurtidoRonda.module.css';

const iconPregunta = <ModalIcon src={iconoPregunta} inset="-2.84% -2.27% -0.56% -1.14%" />;

function Botones({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className={styles.buttons}>
      <Button asset={grupo45} label="Cancelar" className={styles.flex1} onClick={onCancel} />
      <Button variant="success" icon="check" label="Aceptar" className={styles.flex1} onClick={onConfirm} />
    </div>
  );
}

/** Todo surtido / separado → confirmar cierre (mismo patrón que 197:23064). */
export function FinalizarRondaModal({ titulo, texto, onCancel, onConfirm }: { titulo: string; texto: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <ModalSheet icon={iconPregunta} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <p className={styles.subtitle} style={{ width: '100%', textAlign: 'center' }}>
          {titulo}
        </p>
        <Divider variant="modal" />
        <p className={styles.text}>{texto}</p>
        <Botones onCancel={onCancel} onConfirm={onConfirm} />
      </div>
    </ModalSheet>
  );
}

export type GrupoFaltante = {
  /** Encabezado del grupo: un pedido (con su contenedor) o, en la recolección de la propuesta C, toda la ronda. */
  contenedor?: Contenedor;
  titulo: string;
  filas: { codigo: string; avance: number; total: number }[];
};

/** Finalizar con piezas faltantes (mismo patrón que 182:9894). Es informativo: se puede continuar. */
export function FaltantesModal({
  titulo,
  texto,
  grupos,
  onCancel,
  onConfirm,
}: {
  titulo: string;
  texto: string;
  grupos: GrupoFaltante[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalSheet icon={iconPregunta} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <p className={styles.subtitle} style={{ width: '100%', textAlign: 'center' }}>
          {titulo}
        </p>
        <Divider variant="modal" />
        <p className={styles.text}>{texto}</p>
        <div className={ronda.faltantes}>
          {grupos.map((g) => (
            <div key={g.titulo} className={ronda.faltanteGrupo}>
              <div className={ronda.faltanteTitulo}>
                {g.contenedor && <span className={ronda.letra}>{g.contenedor}</span>}
                <b>{g.titulo}</b>
              </div>
              <div className={styles.partialList}>
                {g.filas.map((f, i) => (
                  <Fragment key={f.codigo}>
                    {i > 0 && <Divider variant="modal" />}
                    <div className={styles.partialRow}>
                      <span className={styles.code20}>{f.codigo}</span>
                      <Chip status={f.avance > 0 ? 'parcial' : 'no-iniciado'} value={f.avance} total={f.total} />
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Botones onCancel={onCancel} onConfirm={onConfirm} />
      </div>
    </ModalSheet>
  );
}
