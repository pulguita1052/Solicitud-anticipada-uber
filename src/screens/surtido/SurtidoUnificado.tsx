/**
 * Modo Surtido + Revisión unificado (ERB-47987, frame Figma 6004:2304 "Finalización Surtido + revisión - Automática").
 * Se muestra en `/surtido` cuando `etapa === 'surtido-unificado'`. Presenta un resumen breve del pedido y
 * un botón único "Finalizar" que salta directamente a la facturación (marca el pedido como finalizado y navega
 * a /tareas con etapa='traspaso').
 */
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { Button } from '@ds/components/atoms/Button/Button';
import { Divider } from '@ds/components/atoms/Divider/Divider';
import { conteos, totalArticulos } from '../../domain/pedido';
import { PEDIDO_ID, PRODUCTOS } from '../../mocks/pedido';
import { useStore } from '../../store/AppStore';
import styles from './SurtidoUnificado.module.css';

const TOAST_FINALIZADO = {
  kind: 'success' as const,
  title: 'Surtido y revisión finalizados',
  message: '¡Se completó la ronda de surtido y revisión unificada!',
};

export function SurtidoUnificado() {
  const navigate = useNavigate();
  const { pedido, dispatch, mostrarToast, setEtapa } = useStore();
  const c = conteos(pedido);
  const articulos = totalArticulos(pedido);
  const totalPiezas = PRODUCTOS.reduce((n, p) => n + p.solicitado, 0);

  const finalizar = () => {
    if (!pedido.finalizado) dispatch({ type: 'finalizar' });
    setEtapa('traspaso');
    mostrarToast(TOAST_FINALIZADO);
    navigate('/tareas');
  };

  return (
    <div className={styles.screen}>
      <AppHeader showBack={false} />
      <ContentPanel title="Surtido + revisión unificados" paddingBottom={45} bottom={0}>
        <div className={styles.center}>
          <div className={styles.badge}>Unificado</div>
          <p className={styles.h1}>Pedido #{PEDIDO_ID}</p>
          <p className={styles.text}>
            En este modo el operador surte y revisa cada partida en un solo paso. Cuando termina, el botón
            "Finalizar" cierra la tarea y pasa a facturación.
          </p>
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <b>Partidas</b>
              <span>{PRODUCTOS.length}</span>
            </div>
            <Divider variant="modal" />
            <div className={styles.infoRow}>
              <b>Piezas solicitadas</b>
              <span>{totalPiezas}</span>
            </div>
            <Divider variant="modal" />
            <div className={styles.infoRow}>
              <b>Piezas surtidas</b>
              <span>{articulos}</span>
            </div>
            <Divider variant="modal" />
            <div className={styles.infoRow}>
              <b>Completadas / Parciales / Negadas</b>
              <span>
                {c.completado} / {c.parcial} / {c.negado}
              </span>
            </div>
          </div>
        </div>
      </ContentPanel>
      <BottomBar>
        <div className="row">
          <Button
            variant="error"
            label="Cancelar"
            className={styles.flex1}
            onClick={() => navigate('/tareas')}
          />
          <Button
            variant="success"
            label="Finalizar"
            className={styles.flex1}
            onClick={finalizar}
          />
        </div>
      </BottomBar>
    </div>
  );
}
