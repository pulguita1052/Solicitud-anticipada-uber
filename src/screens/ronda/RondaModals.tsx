/**
 * Modales de la ronda multipedido. Sin respaldo en Figma (2888:9537 vacía): se componen con los mismos
 * elementos de "Finalizar surtido" (197:23064) y "Modal pendientes parciales" (182:9894).
 */
import { Fragment, useState } from 'react';
import iconoPregunta from '@assets/icons/modal-icono-pregunta.svg';
import iconoMotivo from '@assets/icons/modal-icono-motivo-negado.svg';
import iconoInfo from '@assets/icons/info.svg';
import iconoA from '@assets/icons/contenedor-a.svg';
import iconoB from '@assets/icons/contenedor-b.svg';
import iconoC from '@assets/icons/contenedor-c.svg';
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

const ICONO_CONTENEDOR: Record<Contenedor, string> = { A: iconoA, B: iconoB, C: iconoC };

export type PedidoNegable = { pedido: string; contenedor: Contenedor; solicitado: number };

/**
 * Negar producto en la ronda, paso 1 de 2: selección de los pedidos a negar (solo los que tienen el producto en 0).
 * El paso 2 es "Selección de motivo negado" (MotivoNegadoModal, 1246:7590): un mismo motivo para todos. Sin respaldo en
 * Figma para este paso (D51).
 *
 * Regla de prioridad (los pedidos van en orden de captura, A primero): un pedido no puede quedarse sin la pieza mientras
 * uno de menor prioridad sí la recibe. Por eso marcar un pedido marca también los siguientes (A → B y C, B → C) y
 * desmarcarlo desmarca los anteriores.
 */
export function SeleccionNegadoModal({
  codigo,
  descripcion,
  pedidos,
  inicial,
  onCancel,
  onConfirm,
}: {
  codigo: string;
  descripcion: string;
  /** En orden de prioridad (captura). */
  pedidos: PedidoNegable[];
  inicial?: string[];
  onCancel: () => void;
  onConfirm: (pedidos: string[]) => void;
}) {
  // Si solo hay un pedido que se puede negar, ya va marcado
  const [marcados, setMarcados] = useState<string[]>(inicial ?? (pedidos.length === 1 ? [pedidos[0].pedido] : []));
  const alternar = (id: string) => {
    const i = pedidos.findIndex((p) => p.pedido === id);
    const on = !marcados.includes(id);
    // Marcar: este y los de menor prioridad · Desmarcar: este y los de mayor prioridad
    const afectados = (on ? pedidos.slice(i) : pedidos.slice(0, i + 1)).map((p) => p.pedido);
    setMarcados((m) => (on ? [...new Set([...m, ...afectados])] : m.filter((x) => !afectados.includes(x))));
  };
  return (
    <ModalSheet icon={<ModalIcon src={iconoMotivo} inset="-2.84% -2.27% -0.56% -1.14%" />} gap={10} doubleShadow>
      <div className={styles.col} style={{ gap: 18 }}>
        <p className={styles.subtitle} style={{ width: '100%', textAlign: 'center' }}>
          Negar producto
        </p>
        <Divider variant="modal" />
        <div className={styles.col} style={{ gap: 10 }}>
          <div className={styles.codeRow}>
            <b>Código</b>
            <span>{codigo}</span>
          </div>
          <p className={styles.descripcion}>{descripcion}</p>
        </div>
        <div className={styles.col} style={{ gap: 14 }}>
          <p className={ronda.negarEtiqueta}>Pedidos a negar</p>
          <div className={ronda.negarLista}>
            {pedidos.map((p, i) => {
              const on = marcados.includes(p.pedido);
              return (
                <Fragment key={p.pedido}>
                  {i > 0 && <Divider variant="modal" />}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    aria-label={`Contenedor ${p.contenedor}, pedido ${p.pedido}`}
                    className={ronda.negarPedido}
                    onClick={() => alternar(p.pedido)}
                  >
                    <span className={`${ronda.casilla} ${on ? ronda.casillaOn : ''}`} aria-hidden>
                      {on ? '✓' : ''}
                    </span>
                    <img src={ICONO_CONTENEDOR[p.contenedor]} alt="" width={30} height={30} />
                    <span className={ronda.negarPedidoDatos}>
                      <b>#{p.pedido}</b>
                      <span>Solicitado {p.solicitado}</span>
                    </span>
                  </button>
                </Fragment>
              );
            })}
          </div>
          <div className={ronda.negarNota} role="note">
            <img src={iconoInfo} alt="" width={20} height={20} />
            <p>Los pedidos se listan en prioridad de surtido, no se podrá negar la pieza a un pedido con mayor prioridad que otro.</p>
          </div>
        </div>
        <div className={styles.buttons}>
          <Button asset={grupo45} label="Cancelar" className={styles.flex1} onClick={onCancel} />
          <Button
            variant="success"
            icon="check"
            label="Aceptar"
            disabled={!marcados.length}
            className={styles.flex1}
            onClick={() => onConfirm(pedidos.map((p) => p.pedido).filter((id) => marcados.includes(id)))}
          />
        </div>
      </div>
    </ModalSheet>
  );
}
