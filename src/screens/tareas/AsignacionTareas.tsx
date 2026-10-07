/**
 * Figma: Asignación de tareas
 * nodeId: 3048:10014 (surtido y revisión) · 6004:1813 (facturar y embarcar, página Facturación)
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=3048-10014
 * Última sincronización: 2026-09-29
 */
import { useNavigate } from 'react-router-dom';
import userIcon from '@assets/icons/user.svg';
import tareaIcon from '@assets/icons/user-tarea.svg';
import activityIcon from '@assets/icons/activity.svg';
import calendarIcon from '@assets/icons/calendar.svg';
import receiptIcon from '@assets/icons/receipt.svg';
import botonCancelar from '@assets/icons/boton-cancelar.svg';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { Button } from '@ds/components/atoms/Button/Button';
import { LabeledField } from '@ds/components/molecules/LabeledField/LabeledField';
import { InfoBlock } from '@ds/components/molecules/InfoBlock/InfoBlock';
import { EMPLEADO, TAREAS } from '../../mocks/pedido';
import { useStore } from '../../store/AppStore';
import styles from './AsignacionTareas.module.css';

export function AsignacionTareas() {
  const navigate = useNavigate();
  const { etapa } = useStore();
  const tarea =
    etapa === 'surtido'
      ? TAREAS.surtido
      : etapa === 'surtido-unificado'
        ? TAREAS.surtidoUnificado
        : TAREAS.embarqueTraspaso;
  const rutaAceptar = etapa === 'surtido' || etapa === 'surtido-unificado' ? '/surtido' : '/traspaso';

  return (
    <div className={styles.screen}>
      <AppHeader backLabel="Menú" onBack={() => navigate('/menu')} onMenu={etapa === 'surtido' ? undefined : () => undefined} />
      <ContentPanel title="Asignación de tareas" paddingBottom={22} align="start">
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <img src={userIcon} alt="" width={11.458} height={11.458} />
            <p>Empleado</p>
          </div>
          <div className={styles.fieldWidth}>
            <LabeledField labelWidth="hug" label={EMPLEADO.id} value={EMPLEADO.nombre} />
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <img src={tareaIcon} alt="" width={11.161} height={13.708} />
            <p>Tarea asignada</p>
          </div>
          <div className={styles.fieldWidth}>
            <LabeledField labelWidth="hug" label={EMPLEADO.id} value={EMPLEADO.nombre} />
          </div>
        </div>
        <InfoBlock title="Actividad" icon={activityIcon} iconSize={{ w: 13.482, h: 19.872 }} rows={[{ value: tarea.actividad }]} />
        <InfoBlock
          title="Fecha"
          icon={calendarIcon}
          iconSize={{ w: 14.589, h: 16.21 }}
          rows={[
            { label: 'Fecha inicio:', value: TAREAS.fecha },
            { label: 'Hora inicio:', value: TAREAS.hora },
          ]}
        />
        <InfoBlock title={tarea.documentoLabel} icon={receiptIcon} iconSize={{ w: 13.482, h: 17.159 }} rows={[{ value: tarea.documento }]} />
      </ContentPanel>
      <BottomBar>
        <div className="row">
          <Button asset={botonCancelar} label="Cancelar" className={styles.half} onClick={() => navigate('/menu')} />
          <Button
            variant="success"
            icon="check"
            label="Aceptar"
            className={styles.half}
            onClick={() => navigate(rutaAceptar)}
          />
        </div>
      </BottomBar>
    </div>
  );
}
