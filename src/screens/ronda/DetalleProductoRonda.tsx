/**
 * Detalle de producto en la ronda multipedido.
 * Base: "Detalle de producto con despliegue" 41:2429 (Handheld for Claude, Zf1wV1oULSD14o7TPW4da9). Propuesta de Claude
 * sobre esa idea con ajustes del usuario (D51).
 *
 * Reglas (usuario, 2026-10-15):
 *   - "Solicitado ronda" = lo que piden todos los pedidos de la ronda (A + B + C).
 *   - La cantidad surtida se edita por pedido: una fila por pedido (contenedor, "Solicitado n", spinner) con divisor.
 *   - "Negar producto" en dos pasos: (1) pedidos a negar, solo los que tienen el producto en 0, con regla de prioridad
 *     (marcar A marca B y C; marcar B marca C); (2) un mismo motivo para todos.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import iconoA from '@assets/icons/contenedor-a.svg';
import iconoB from '@assets/icons/contenedor-b.svg';
import iconoC from '@assets/icons/contenedor-c.svg';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { Button } from '@ds/components/atoms/Button/Button';
import { Chip } from '@ds/components/atoms/Chip/Chip';
import { Divider } from '@ds/components/atoms/Divider/Divider';
import { Stepper } from '@ds/components/atoms/Stepper/Stepper';
import { LabeledField } from '@ds/components/molecules/LabeledField/LabeledField';
import { ProductSummary } from '@ds/components/molecules/ProductSummary/ProductSummary';
import { consolidado, productoRonda } from '../../domain/ronda';
import { MOTIVOS_NEGADO } from '../../mocks/pedido';
import type { Contenedor } from '../../mocks/ronda';
import { useStore } from '../../store/AppStore';
import { VistaFoto } from '../surtido/overlays/VistaFoto';
import { MotivoNegadoModal } from '../surtido/overlays/SurtidoModals';
import { SeleccionNegadoModal } from './RondaModals';
import base from '../surtido/DetalleProducto.module.css';
import styles from './DetalleProductoRonda.module.css';

const ICONO_CONTENEDOR: Record<Contenedor, string> = { A: iconoA, B: iconoB, C: iconoC };

/** "Pasillo 12" → "12" (los campos del Detalle muestran solo el valor). */
const valor = (s: string) => s.replace(/^\D+\s/, '');

const TOAST_NO_NEGAR = {
  kind: 'warning' as const,
  title: 'No es posible negar el producto',
  message: (
    <>
      Para negar un pedido, su <b>cantidad surtida debe ser cero.</b>
    </>
  ),
};

export function DetalleProductoRonda() {
  const { codigo = '' } = useParams();
  const navigate = useNavigate();
  const { ronda, rondaDispatch, mostrarToast } = useStore();
  /** Negar en dos pasos: selección de pedidos → motivo. */
  const [negando, setNegando] = useState<{ paso: 'pedidos' } | { paso: 'motivo'; pedidos: string[] } | null>(null);
  const [viendoFoto, setViendoFoto] = useState(false);
  const p = productoRonda(codigo);
  const linea = consolidado(ronda).find((l) => l.codigo === codigo);
  if (!p || !linea) return null;

  const [planta, pasillo, torre, nivel] = p.ubicacion;
  const solicitadoRonda = linea.porPedido.reduce((n, x) => n + x.solicitado, 0);
  const negables = linea.porPedido.filter((x) => !x.motivoNegado && x.separado === 0);
  // Vuelve a la lista con el filtro que tenía (?pedido=); si se abrió directo (sin historial en la app), a la lista
  const regresar = () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/ronda'));

  return (
    <div className={base.screen}>
      <AppHeader onBack={regresar} />
      <ContentPanel title="Detalle del producto" bottom={0}>
        <div className={styles.scroll}>
          <div className={base.datos}>
            <ProductSummary foto={p.foto} codigo={p.codigo} descripcion={p.descripcion} photoStyle="framed" onPhotoClick={() => setViendoFoto(true)} />
            <div className={base.grid}>
              <div className={base.pair}>
                <LabeledField label="Ubicación" value={planta} />
                <LabeledField label="Pasillo" value={valor(pasillo)} />
              </div>
              <div className={base.pair}>
                <LabeledField label="Torre" value={valor(torre)} />
                <LabeledField label="Nivel" value={valor(nivel)} />
              </div>
              <div className={base.pair}>
                <LabeledField label="Existencia" value={p.existencia} valueBold />
                <LabeledField
                  label={
                    <>
                      Solicitado
                      <br />
                      ronda
                    </>
                  }
                  value={solicitadoRonda}
                />
              </div>
            </div>
          </div>

          {/* Surtido por pedido: una fila por pedido con divisor */}
          <section className={styles.pedidos} aria-label="Surtido por pedido">
            {linea.porPedido.map((x, i) => (
              <div key={x.pedido} className={styles.pedidoItem}>
                {i > 0 && <Divider variant="list" />}
                <div className={styles.pedido}>
                  <img src={ICONO_CONTENEDOR[x.contenedor]} alt={`Contenedor ${x.contenedor}`} width={30} height={30} />
                  <span className={styles.solicitado}>Solicitado {x.solicitado}</span>
                  {x.motivoNegado ? (
                    <div className={styles.negado}>
                      <Chip status="negado" />
                    </div>
                  ) : (
                    <div className={styles.stepper}>
                      <Stepper
                        value={x.separado}
                        min={0}
                        max={x.solicitado}
                        onChange={(cantidad) => rondaDispatch({ type: 'fijarSeparado', pedido: x.pedido, codigo, cantidad })}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        </div>
      </ContentPanel>
      <BottomBar variant="footer">
        <Button variant="default" label="Regresar" className={base.flex1} onClick={regresar} />
        <Button
          variant="default"
          label="Negar producto"
          disabled={linea.negado}
          className={base.flex1}
          onClick={() => (negables.length ? setNegando({ paso: 'pedidos' }) : mostrarToast(TOAST_NO_NEGAR))}
        />
      </BottomBar>

      {viendoFoto && <VistaFoto foto={p.foto} onClose={() => setViendoFoto(false)} />}
      {negando?.paso === 'pedidos' && (
        <SeleccionNegadoModal
          codigo={p.codigo}
          descripcion={p.descripcion}
          pedidos={negables.map((x) => ({ pedido: x.pedido, contenedor: x.contenedor, solicitado: x.solicitado }))}
          onCancel={() => setNegando(null)}
          onConfirm={(pedidos) => setNegando({ paso: 'motivo', pedidos })}
        />
      )}
      {negando?.paso === 'motivo' && (
        <MotivoNegadoModal
          codigo={p.codigo}
          descripcion={p.descripcion}
          motivos={MOTIVOS_NEGADO}
          onCancel={() => setNegando(null)}
          onConfirm={(motivo) => {
            const pedidos = negando.pedidos;
            rondaDispatch({ type: 'negar', codigo, pedidos, motivo });
            setNegando(null);
            const letras = negables.filter((x) => pedidos.includes(x.pedido)).map((x) => x.contenedor);
            mostrarToast({
              kind: 'success',
              title: 'Producto negado',
              message: `${codigo} se negó en ${letras.length > 1 ? 'los pedidos' : 'el pedido'} ${letras.join(', ')}.`,
            });
          }}
        />
      )}
    </div>
  );
}
