/**
 * Detalle de la ronda — pantalla previa al surtido multipedido: qué pedido va en cada contenedor, de qué cliente,
 * cuántas piezas y qué códigos. Resalta los pedidos del mismo cliente (venta dividida en varios pedidos, D50).
 * Base: frame en progreso "Detalle de la ronda" 24:2029 y "Panel info" 27:2320 (Handheld for Claude,
 * Zf1wV1oULSD14o7TPW4da9). El aviso, el resaltado y los botones no están en Figma (D50).
 */
import { useNavigate } from 'react-router-dom';
import iconoA from '@assets/icons/contenedor-a.svg';
import iconoB from '@assets/icons/contenedor-b.svg';
import iconoC from '@assets/icons/contenedor-c.svg';
import assignment from '@assets/icons/assignment.svg';
import person from '@assets/icons/person-panel.svg';
import pendiente from '@assets/icons/estado-pendiente.svg';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { Button } from '@ds/components/atoms/Button/Button';
import { mismosClientes } from '../../domain/ronda';
import { CATALOGO_RONDA, PEDIDOS_RONDA, type Contenedor } from '../../mocks/ronda';
import styles from './DetalleRonda.module.css';

const ICONO_CONTENEDOR: Record<Contenedor, string> = { A: iconoA, B: iconoB, C: iconoC };

/** "A y B", "A, B y C" */
const enumerar = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}` : xs[0]);

export function DetalleRonda() {
  const navigate = useNavigate();
  const grupos = mismosClientes();
  const totalPiezas = PEDIDOS_RONDA.reduce((n, p) => n + p.partidas.reduce((m, x) => m + x.solicitado, 0), 0);
  const totalCodigos = CATALOGO_RONDA.filter((c) => PEDIDOS_RONDA.some((p) => p.partidas.some((x) => x.codigo === c.codigo))).length;

  return (
    <div className={styles.screen}>
      <AppHeader backLabel="Menú" onBack={() => navigate('/menu')} />
      <ContentPanel title="Detalle de la ronda">
        <div className={styles.contenido}>
          <p className={styles.intro}>
            Esta ronda tiene <b>{PEDIDOS_RONDA.length} pedidos</b> ({totalPiezas} pz · {totalCodigos} códigos). Prepara un contenedor por
            pedido antes de iniciar el surtido.
          </p>

          {grupos.map((g) => (
            <div key={g.cliente.id} className={styles.aviso} role="note">
              <img src={pendiente} alt="" width={24} height={24} />
              <p>
                Los pedidos <b>{enumerar(g.pedidos.map((p) => p.contenedor))}</b> son del mismo cliente.
                {g.codigosEnComun.length > 0 && (
                  <>
                    {' '}
                    Revisa <b>{enumerar(g.codigosEnComun)}</b>: si se vende por medida (cable, manguera), confirma si va en una sola pieza.
                  </>
                )}
              </p>
            </div>
          ))}

          {PEDIDOS_RONDA.map((p) => {
            const grupo = grupos.find((g) => g.pedidos.includes(p));
            const piezas = p.partidas.reduce((n, x) => n + x.solicitado, 0);
            return (
              <section key={p.id} className={`${styles.panel} ${grupo ? styles.panelMismoCliente : ''}`} aria-label={`Contenedor ${p.contenedor}`}>
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
                  <span>#{p.id}</span>
                  <span className={styles.captura}>{p.capturado}</span>
                </div>
                <div className={styles.dato}>
                  <img src={person} alt="" width={20} height={20} />
                  <span className={styles.cliente}>{p.cliente.nombre}</span>
                  {grupo && <span className={styles.badge}>Mismo cliente</span>}
                </div>
                <div className={styles.codigos}>
                  {p.partidas.map((x) => (
                    <span key={x.codigo} className={`${styles.codigo} ${grupo?.codigosEnComun.includes(x.codigo) ? styles.codigoEnComun : ''}`}>
                      <b>{x.codigo}</b> {x.solicitado} pz
                    </span>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </ContentPanel>
      <BottomBar variant="footer">
        <Button variant="default" label="Regresar" className={styles.flex1} onClick={() => navigate('/tareas')} />
        <Button variant="success" label="Iniciar surtido" className={styles.flex1} onClick={() => navigate('/ronda')} />
      </BottomBar>
    </div>
  );
}
