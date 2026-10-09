/**
 * Figma: Surtido de órdenes ("Interfaz principal - NO INICIADO" / "INICIADO") — 📲 Surtido - Un pedido x ronda
 * nodeId: 109:357 · 131:4492 — secciones 99:219 (interfaz principal), 182:7444 (finalización manual),
 *         197:19260 (finalización automática)
 * URL: https://www.figma.com/design/zZBoCtJor0tdJ91umiqb7l/?node-id=99-219
 * Última sincronización: 2026-10-09
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@ds/components/organisms/AppHeader/AppHeader';
import { ContentPanel } from '@ds/components/organisms/ContentPanel/ContentPanel';
import { BottomBar } from '@ds/components/organisms/BottomBar/BottomBar';
import { OrderProgress } from '@ds/components/molecules/OrderProgress/OrderProgress';
import { OrderItemRow } from '@ds/components/molecules/OrderItemRow/OrderItemRow';
import { ScanInput, type ScanInputHandle } from '@ds/components/molecules/ScanInput/ScanInput';
import { Divider } from '@ds/components/atoms/Divider/Divider';
import { leerCodigo } from '../../domain/codigos';
import { conteos, listoParaFinalizar, parciales, producto, sinSurtir, statusDe } from '../../domain/pedido';
import { decir, sonar } from '../../domain/sonidos';
import { useStore } from '../../store/AppStore';
import { CantidadModal, FinalizarModal, MenuModal, ParcialesModal, SinSurtirModal } from './overlays/SurtidoModals';
import styles from './SurtidoOrdenes.module.css';

type Overlay = { k: 'cantidad'; codigo: string } | { k: 'menu' } | { k: 'sinSurtir' } | { k: 'parciales' } | { k: 'finalizar' };

/** 192:16730 / 197:20533 */
export const TOAST_FINALIZADO = { kind: 'success' as const, title: 'Surtido finalizado', message: '¡Se completó la ronda de surtido exitosamente!' };
/** 325:3026 — "Estructura del CB no válida" */
const TOAST_CODIGO_INVALIDO = { kind: 'error' as const, title: 'Código inválido', message: 'El código de barras capturado no es válido.' };
/** 1509:9441 — el código escaneado pertenece a un producto ya negado */
const TOAST_PRODUCTO_NEGADO = { kind: 'error' as const, title: 'Producto negado', message: 'El código escaneado fue negado y no es posible agregar unidades.' };
/** "¿Se ingresó una cantidad válida?" (623:3472) → 131:6181 · 188:10280 · 986:3915 */
const TOAST_CANTIDAD = {
  mayorPendiente: 'La cantidad que intentas ingresar es mayor a la solicitada. Por favor, ingresa una cantidad igual o menor.',
  mayorExistencia: 'La cantidad que intentas ingresar es mayor a la existencia actual. Por favor, ingresa una cantidad igual o menor.',
  cero: 'No es posible surtir un producto con cantidad cero. Por favor, ingresa una cantidad mayor.',
};

export function SurtidoOrdenes() {
  const navigate = useNavigate();
  const { pedido, dispatch, mostrarToast, setEtapa } = useStore();
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [autoDescartado, setAutoDescartado] = useState(false);
  const scanRef = useRef<ScanInputHandle>(null);
  const c = conteos(pedido);

  const cerrar = () => {
    setOverlay(null);
    window.setTimeout(() => scanRef.current?.focus(), 0);
  };

  const onScan = (valor: string) => {
    const l = leerCodigo(valor);
    if (l.tipo === 'invalido') {
      sonar('error');
      mostrarToast(TOAST_CODIGO_INVALIDO);
      return;
    }
    const item = pedido.items.find((i) => i.codigo === l.codigo);
    if (!item) return sonar('error'); // PENDIENTE: Figma no define el aviso para un código ajeno al pedido
    if (item.negado) {
      sonar('error');
      mostrarToast(TOAST_PRODUCTO_NEGADO);
      return;
    }
    // Código de 7 caracteres → modal de cantidad manual (330:3096 → 131:6184)
    if (l.tipo === 'codigo') return setOverlay({ k: 'cantidad', codigo: l.codigo });
    // Etiqueta de 18 caracteres → cantidad de los caracteres 8 al 14 (1007:4012 → 131:4198)
    if (item.surtido >= producto(l.codigo)!.solicitado) return sonar('error');
    sonar('ok');
    dispatch({ type: 'surtir', codigo: l.codigo, cantidad: l.cantidad });
  };

  const confirmarCantidad = (codigo: string, n: number) => {
    const p = producto(codigo)!;
    const item = pedido.items.find((i) => i.codigo === codigo)!;
    const error =
      n <= 0
        ? TOAST_CANTIDAD.cero
        : item.surtido + n > p.solicitado
          ? TOAST_CANTIDAD.mayorPendiente
          : item.surtido + n > p.existencia
            ? TOAST_CANTIDAD.mayorExistencia
            : null;
    if (error) {
      sonar('error');
      mostrarToast({ kind: 'error', title: 'Cantidad inválida', message: error });
      return;
    }
    sonar('ok');
    dispatch({ type: 'surtir', codigo, cantidad: n });
    cerrar();
  };

  // ---- Finalización: Asignación de tareas con la siguiente tarea + toast (197:22893 → 197:20499 + 197:20533)
  const terminar = () => {
    dispatch({ type: 'finalizar' });
    setEtapa('revision');
    navigate('/tareas');
    mostrarToast(TOAST_FINALIZADO);
  };

  /** Menú › Finalizar surtido: ¿códigos sin surtir? (237:3071) → ¿códigos parciales? (237:3067) → fin. */
  const finalizarManual = () => {
    if (sinSurtir(pedido).length) setOverlay({ k: 'sinSurtir' });
    else if (parciales(pedido).length) setOverlay({ k: 'parciales' });
    else terminar();
  };

  // Finalización automática: todo surtido → 600 ms → "Finalizar surtido" (197:22719 → 197:22893)
  const listo = listoParaFinalizar(pedido);
  useEffect(() => {
    if (!listo) setAutoDescartado(false);
  }, [listo]);
  useEffect(() => {
    if (!listo || overlay || autoDescartado || pedido.finalizado) return;
    const t = window.setTimeout(() => setOverlay({ k: 'finalizar' }), 600);
    return () => window.clearTimeout(t);
  }, [listo, overlay, autoDescartado, pedido.finalizado]);

  const ov = overlay;
  return (
    <div className={styles.screen}>
      <AppHeader backLabel="Menú" onBack={() => navigate('/menu')} onMenu={() => setOverlay({ k: 'menu' })} />
      <ContentPanel title="Surtido de órdenes">
        <OrderProgress pedido={pedido.id} completado={c.completado} negado={c.negado} parcial={c.parcial} pendientes={c.pendientes} />
        <div className={styles.list}>
          {pedido.items.map((it, idx) => {
            const p = producto(it.codigo)!;
            return (
              <div key={it.codigo} className={styles.itemContainer}>
                {idx > 0 && <Divider variant="list" />}
                <OrderItemRow
                  codigo={it.codigo}
                  status={statusDe(it)}
                  surtido={it.surtido}
                  solicitado={p.solicitado}
                  ubicacion={p.ubicacion}
                  onClick={() => navigate(`/surtido/producto/${it.codigo}`)}
                />
              </div>
            );
          })}
        </div>
      </ContentPanel>
      <BottomBar>
        <ScanInput ref={scanRef} onScan={onScan} autoFocus={!ov} />
      </BottomBar>

      {ov?.k === 'cantidad' && <CantidadModal codigo={ov.codigo} onCancel={cerrar} onConfirm={(n) => confirmarCantidad(ov.codigo, n)} />}
      {ov?.k === 'menu' && (
        <MenuModal
          onRepetirAudio={() => {
            const sig = pedido.items.find((i) => statusDe(i) === 'no-iniciado' || statusDe(i) === 'parcial');
            if (sig) decir(`Código ${sig.codigo.split('').join(' ')}. ${producto(sig.codigo)!.ubicacion.join(', ')}`);
          }}
          onFinalizar={finalizarManual}
          onCancel={cerrar}
        />
      )}
      {ov?.k === 'sinSurtir' && <SinSurtirModal onCancel={cerrar} />}
      {ov?.k === 'parciales' && (
        <ParcialesModal
          rows={parciales(pedido).map((i) => ({
            codigo: i.codigo,
            surtido: i.surtido,
            solicitado: producto(i.codigo)!.solicitado,
            existencia: producto(i.codigo)!.existencia,
          }))}
          onCancel={cerrar}
          onConfirm={terminar}
        />
      )}
      {ov?.k === 'finalizar' && (
        <FinalizarModal
          onCancel={() => {
            setAutoDescartado(true);
            cerrar();
          }}
          onConfirm={terminar}
        />
      )}
    </div>
  );
}
