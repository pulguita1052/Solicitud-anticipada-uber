/**
 * Figma: Detalle de la ronda (Claude) — pantalla previa al surtido multipedido
 * nodeId: 34:2 (Handheld for Claude, Zf1wV1oULSD14o7TPW4da9) — paneles "Panel contenedor A/B/C" 34:139 / 34:168 / 34:195
 * URL: https://www.figma.com/design/Zf1wV1oULSD14o7TPW4da9/?node-id=34-2
 * Última sincronización: 2026-10-15
 *
 * Qué pedido va en cada contenedor, folio, hora de captura, cliente, piezas y códigos. Los pedidos del mismo cliente
 * (venta dividida en varios pedidos) llevan la etiqueta "Mismo cliente" (D50).
 */
import { useNavigate } from 'react-router-dom';
import iconoA from '@assets/icons/contenedor-a.svg';
import iconoB from '@assets/icons/contenedor-b.svg';
import iconoC from '@assets/icons/contenedor-c.svg';
import assignment from '@assets/icons/assignment.svg';
import person from '@assets/icons/person-panel.svg';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { Button } from '@ds/components/atoms/Button/Button';
import { mismosClientes } from '../../domain/ronda';
import { PEDIDOS_RONDA, type Contenedor } from '../../mocks/ronda';
import styles from './DetalleRonda.module.css';

const ICONO_CONTENEDOR: Record<Contenedor, string> = { A: iconoA, B: iconoB, C: iconoC };

export function DetalleRonda() {
  const navigate = useNavigate();
  const mismoCliente = new Set(mismosClientes().flatMap((g) => g.pedidos.map((p) => p.id)));

  return (
    <div className={styles.screen}>
      <AppHeader backLabel="Menú" onBack={() => navigate('/menu')} />
      <ContentPanel title="Detalle de la ronda">
        <div className={styles.contenido}>
          {PEDIDOS_RONDA.map((p) => {
            const piezas = p.partidas.reduce((n, x) => n + x.solicitado, 0);
            return (
              <section key={p.id} className={styles.panel} aria-label={`Contenedor ${p.contenedor}`}>
                <div className={styles.encabezado}>
                  <img src={ICONO_CONTENEDOR[p.contenedor]} alt={`Contenedor ${p.contenedor}`} width={30} height={30} />
                  <div className={styles.totales}>
                    <b>{piezas} pz</b>
                    <span>{p.partidas.length} códigos</span>
                  </div>
                </div>
                <div className={styles.divider} />
                <div className={styles.dato}>
                  <img src={assignment} alt="" width={20} height={20} />
                  <span className={styles.texto}>#{p.id}</span>
                  <span className={styles.captura}>{p.capturado}</span>
                </div>
                <div className={styles.dato}>
                  <img src={person} alt="" width={20} height={20} />
                  <span className={styles.texto}>{p.cliente.nombre}</span>
                  {mismoCliente.has(p.id) && <span className={styles.badge}>Mismo cliente</span>}
                </div>
              </section>
            );
          })}
        </div>
      </ContentPanel>
      <BottomBar variant="footer">
        <Button variant="success" label="Iniciar surtido" className={styles.flex1} onClick={() => navigate('/ronda')} />
      </BottomBar>
    </div>
  );
}
