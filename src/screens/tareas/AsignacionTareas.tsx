/**
 * Figma: Asignación de tareas
 * nodeId: 86:37 (surtir pedido cliente) · 197:20499 (siguiente tarea: revisar pedido cliente) — 📲 Surtido - Un pedido x ronda
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=86-37
 * Última sincronización: 2026-10-09
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
  // En esta rama solo existe el surtido: la tarea de revisión se muestra como siguiente paso, pero no se puede aceptar.
  const puedeAceptar = etapa === 'surtido';
  const tarea = puedeAceptar ? TAREAS.surtido : TAREAS.revision;

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
            disabled={!puedeAceptar}
            onClick={() => navigate('/surtido')}
          />
        </div>
      </BottomBar>
    </div>
  );
}
