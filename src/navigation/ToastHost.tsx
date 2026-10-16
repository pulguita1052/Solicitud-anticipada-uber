/**
 * Overlay de avisos. Figma: frames "Toast revisión completada" (3085:11302) y "Surtido completado TOAST" (3236:17501)
 * con overlayPositionType TOP_CENTER, sin fondo; el toast va 30 px por debajo del borde del overlay (416 × 166).
 * Entrada: MOVE_IN 300 ms EASE_OUT. Al aparecer cambia a la variante "Toast=Fin" (la barra inferior se vacía,
 * SMART_ANIMATE 3000 ms EASE_OUT).
 */
import { useEffect, useState } from 'react';
import { Toast } from '../design-system/components/organisms/Toast/Toast';
import { useStore, type ToastData } from '../store/AppStore';
import styles from './ToastHost.module.css';

export function ToastHost() {
  const { toast, cerrarToast } = useStore();
  if (!toast) return null;
  // key = id: cada toast se monta de nuevo con su propio estado, así su barra siempre empieza llena
  return <ToastAnimado key={toast.id} toast={toast} onClose={cerrarToast} />;
}

function ToastAnimado({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  const [fin, setFin] = useState(false);

  useEffect(() => {
    // Dos cuadros: el navegador pinta primero la barra llena y después anima su vaciado
    let segundo = 0;
    const primero = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(() => setFin(true));
    });
    // Figma no define el cierre automático; se cierra al terminar la barra (docs/figma/discrepancias.md D29).
    const cierre = window.setTimeout(onClose, 300 + 3000);
    return () => {
      cancelAnimationFrame(primero);
      cancelAnimationFrame(segundo);
      window.clearTimeout(cierre);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div className={styles.slot}>
        <Toast kind={toast.kind} title={toast.title} message={toast.message} onClose={onClose} fin={fin} />
      </div>
    </div>
  );
}
